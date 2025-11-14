'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Brand } from '@/types';

interface BrandStats {
  total_prompts: number;
  active_prompts: number;
  total_topics: number;
  total_keywords: number;
  visibility_score: number;
  total_mentions: number;
  last_tracked_at: string | null;
}

interface BrandWithStats extends Brand {
  stats?: {
    totalPrompts: number;
    activePrompts: number;
    totalTopics: number;
    totalKeywords: number;
    visibilityScore: number;
    totalMentions: number;
    lastTrackedAt?: string;
  };
}

interface CreateBrandInput {
  name: string;
  website_url?: string;
  description?: string;
  industry?: string;
  entity_type?: 'person' | 'organization' | 'product' | 'other';
  location_type?: 'global' | 'location';
  location_value?: string;
  variations?: string[];
  logo_url?: string;
  onboarding_completed?: boolean;
}

interface UpdateBrandInput extends Partial<CreateBrandInput> {
  id: string;
}

// Convert snake_case API response to camelCase for frontend
function transformBrandStats(apiStats: BrandStats) {
  return {
    totalPrompts: apiStats.total_prompts,
    activePrompts: apiStats.active_prompts,
    totalTopics: apiStats.total_topics,
    totalKeywords: apiStats.total_keywords,
    visibilityScore: apiStats.visibility_score,
    totalMentions: apiStats.total_mentions,
    lastTrackedAt: apiStats.last_tracked_at || undefined,
  };
}

/**
 * Fetch all brands for the authenticated user
 */
async function fetchBrands(includeStats = false): Promise<BrandWithStats[]> {
  const url = `/api/brands?includeStats=${includeStats}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to fetch brands');
  }

  const data = await response.json();

  // If includeStats is true, transform the stats
  if (includeStats && data.brands) {
    return data.brands.map((brand: any) => ({
      ...brand,
      stats: brand.total_prompts !== undefined ? transformBrandStats(brand) : undefined,
    }));
  }

  return data.brands || [];
}

/**
 * Fetch a single brand by ID
 */
async function fetchBrand(id: string, includeStats = false): Promise<BrandWithStats> {
  const url = `/api/brands/${id}?includeStats=${includeStats}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Brand not found');
    }
    throw new Error('Failed to fetch brand');
  }

  const data = await response.json();

  // Transform stats if included
  if (includeStats && data.stats) {
    return {
      ...data.brand,
      stats: transformBrandStats(data.stats),
    };
  }

  return data.brand;
}

/**
 * Create a new brand
 */
async function createBrand(input: CreateBrandInput): Promise<Brand> {
  const response = await fetch('/api/brands', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create brand');
  }

  const data = await response.json();
  return data.brand;
}

/**
 * Update a brand
 */
async function updateBrand({ id, ...input }: UpdateBrandInput): Promise<Brand> {
  const response = await fetch(`/api/brands/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update brand');
  }

  const data = await response.json();
  return data.brand;
}

/**
 * Delete a brand (soft delete)
 */
async function deleteBrand(id: string): Promise<void> {
  const response = await fetch(`/api/brands/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete brand');
  }
}

/**
 * Hook to fetch all brands
 */
export function useBrands(includeStats = false) {
  return useQuery({
    queryKey: ['brands', { includeStats }],
    queryFn: () => fetchBrands(includeStats),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single brand
 */
export function useBrand(id: string, includeStats = false) {
  return useQuery({
    queryKey: ['brands', id, { includeStats }],
    queryFn: () => fetchBrand(id, includeStats),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a brand
 */
export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBrand,
    onSuccess: (brand) => {
      // Invalidate and refetch brands
      queryClient.invalidateQueries({ queryKey: ['brands'] });

      toast.success('Brand created successfully', {
        description: `${brand.name} has been added to your dashboard.`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to create brand', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to update a brand
 */
export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateBrand,
    onSuccess: (brand) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brands', brand.id] });

      toast.success('Brand updated successfully', {
        description: `${brand.name} has been updated.`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to update brand', {
        description: error.message,
      });
    },
  });
}

/**
 * Hook to delete a brand
 */
export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['brands'] });

      toast.success('Brand deleted successfully', {
        description: 'The brand has been removed from your dashboard.',
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to delete brand', {
        description: error.message,
      });
    },
  });
}
