'use client';

import { Button } from '@/components/ui/button';
import { BrandCard, BrandCardSkeleton } from '@/components/dashboard/BrandCard';
import { useBrands } from '@/hooks/useBrands';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import { Plus, Target, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DashboardPage() {
  const { profile } = useAuthStore();
  const { data: brands, isLoading, error } = useBrands(true); // Include stats

  const userName = profile?.full_name || 'there';
  const hasBrands = brands && brands.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="container px-4 py-8">
        <div className="mb-8">
          <div className="h-10 w-64 bg-muted rounded animate-pulse mb-2" />
          <div className="h-6 w-96 bg-muted rounded animate-pulse" />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="h-7 w-32 bg-muted rounded animate-pulse" />
          <div className="h-10 w-32 bg-muted rounded animate-pulse" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <BrandCardSkeleton />
          <BrandCardSkeleton />
          <BrandCardSkeleton />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load brands. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Empty state
  if (!hasBrands) {
    return (
      <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-20">
        <div className="max-w-2xl text-center">
          <div className="mb-8">
            <Target className="mx-auto h-16 w-16 text-muted-foreground" />
          </div>
          <h1 className="mb-4 text-3xl font-bold tracking-tight">
            Welcome to RankMeUpon.ai
          </h1>
          <p className="mb-8 text-lg text-muted-foreground">
            Get started by creating your first brand to track its visibility
            across AI search engines.
          </p>
          <Button size="lg" asChild>
            <Link href="/onboarding">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Brand
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Main dashboard with brands
  return (
    <div className="container px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">
          Hey {userName}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage and monitor all your brands in one place
        </p>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Brands ({brands.length})</h2>
        <Button asChild>
          <Link href="/onboarding/step-1">
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <BrandCard
            key={brand.id}
            brand={brand}
            stats={
              brand.stats
                ? {
                    totalPrompts: brand.stats.totalPrompts || 0,
                    activePrompts: brand.stats.activePrompts || 0,
                    visibilityScore: brand.stats.visibilityScore || 0,
                    totalMentions: brand.stats.totalMentions || 0,
                    lastTrackedAt: brand.stats.lastTrackedAt,
                  }
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
