'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowRight, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import type { Brand } from '@/types';

interface BrandStats {
  totalPrompts: number;
  activePrompts: number;
  visibilityScore: number;
  totalMentions: number;
  lastTrackedAt?: string;
}

interface BrandCardProps {
  brand: Brand;
  stats?: BrandStats;
  isLoading?: boolean;
  showActions?: boolean;
}

export function BrandCard({ brand, stats, isLoading = false, showActions = true }: BrandCardProps) {
  const visibilityScore = stats?.visibilityScore ?? 0;
  const hasPositiveTrend = visibilityScore > 50; // Simplified - could compare with previous period

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {/* Brand Logo/Icon */}
            {brand.logo_url ? (
              <Image
                src={brand.logo_url}
                alt={brand.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-blue-600/20">
                <Target className="h-6 w-6 text-primary" />
              </div>
            )}

            {/* Brand Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{brand.name}</h3>
                {!(brand as any).onboarding_completed && (
                  <Badge variant="secondary" className="text-xs">
                    Setup
                  </Badge>
                )}
              </div>

              {brand.website_url && (
                <a
                  href={brand.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {new URL(brand.website_url).hostname}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}

              {brand.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {brand.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Total Prompts */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">
              {isLoading ? 'Loading...' : 'Total Prompts'}
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {isLoading ? '-' : stats?.totalPrompts ?? 0}
            </div>
            {!isLoading && stats && stats.activePrompts > 0 && (
              <div className="text-xs text-muted-foreground">
                {stats.activePrompts} active
              </div>
            )}
          </div>

          {/* Visibility Score */}
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">
              {isLoading ? 'Loading...' : 'AI Visibility'}
            </div>
            <div className="flex items-baseline gap-1">
              <div className="text-2xl font-bold tabular-nums">
                {isLoading ? '-' : visibilityScore > 0 ? Math.round(visibilityScore) : '-'}
              </div>
              {!isLoading && visibilityScore > 0 && (
                <>
                  <div className="text-sm text-muted-foreground">%</div>
                  {hasPositiveTrend ? (
                    <TrendingUp className="ml-1 h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="ml-1 h-4 w-4 text-muted-foreground" />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mentions Counter */}
        {!isLoading && stats && stats.totalMentions > 0 && (
          <div className="rounded-lg bg-accent/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Mentions</span>
              <span className="text-lg font-semibold">{stats.totalMentions}</span>
            </div>
          </div>
        )}

        {/* Last Tracked */}
        {!isLoading && stats?.lastTrackedAt && (
          <div className="text-xs text-muted-foreground">
            Last tracked {formatDistanceToNow(new Date(stats.lastTrackedAt), { addSuffix: true })}
          </div>
        )}

        {/* Status Message for New Brands */}
        {!isLoading && stats && stats.totalPrompts === 0 && (
          <div className="rounded-lg border border-dashed border-border p-3">
            <p className="text-sm text-center text-muted-foreground">
              No prompts yet. Add prompts to start tracking.
            </p>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2">
            <Button asChild variant="outline" className="flex-1 group/btn">
              <Link href={`/brands/${brand.id}`}>
                View Details
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Link>
            </Button>
            {!(brand as any).onboarding_completed && (
              <Button asChild variant="default" className="flex-1">
                <Link href={`/onboarding/step-1?brandId=${brand.id}`}>
                  Complete Setup
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Loading skeleton component
export function BrandCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-lg bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            <div className="h-8 w-12 bg-muted rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
            <div className="h-8 w-12 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-full bg-muted rounded animate-pulse" />
      </CardContent>
    </Card>
  );
}
