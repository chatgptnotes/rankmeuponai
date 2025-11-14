'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface VisibilityScoreCardProps {
  score: number;
  previousScore?: number;
  lastUpdated?: string;
  isLoading?: boolean;
  className?: string;
}

export function VisibilityScoreCard({
  score,
  previousScore,
  lastUpdated,
  isLoading = false,
  className,
}: VisibilityScoreCardProps) {
  const scoreDelta = previousScore !== undefined ? score - previousScore : 0;
  const hasPositiveTrend = scoreDelta > 0;
  const hasNegativeTrend = scoreDelta < 0;

  const getScoreColor = (value: number) => {
    if (value >= 70) return 'text-green-500';
    if (value >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (value: number) => {
    if (value >= 70) return 'Excellent';
    if (value >= 50) return 'Good';
    if (value >= 30) return 'Fair';
    return 'Needs Improvement';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted rounded animate-pulse mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-32 w-32 bg-muted rounded-full animate-pulse mx-auto" />
          <div className="h-2 w-full bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('transition-all hover:shadow-lg', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Brand Visibility Score</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Your brand&apos;s visibility score across all AI engines. Calculated based on
                  mention frequency, ranking position, and sentiment. Higher is better.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>
          Overall AI search presence across all engines
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Circular Score Display */}
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-8 border-muted">
                <div className="text-center">
                  <div className={cn('text-4xl font-bold tabular-nums', getScoreColor(score))}>
                    {Math.round(score)}
                  </div>
                  <div className="text-xs text-muted-foreground">/ 100</div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{getScoreLabel(score)}</span>
              <span className={cn('font-medium', getScoreColor(score))}>
                {Math.round(score)}%
              </span>
            </div>
            <Progress value={score} className="h-2" />
          </div>

          {/* Trend Indicator */}
          {previousScore !== undefined && (
            <div className="flex items-center justify-between rounded-lg bg-accent/50 p-3">
              <div className="flex items-center gap-2">
                {hasPositiveTrend && (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">
                      +{Math.abs(scoreDelta).toFixed(1)}%
                    </span>
                  </>
                )}
                {hasNegativeTrend && (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-500">
                      {scoreDelta.toFixed(1)}%
                    </span>
                  </>
                )}
                {!hasPositiveTrend && !hasNegativeTrend && (
                  <span className="text-sm text-muted-foreground">No change</span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">vs. last period</span>
            </div>
          )}

          {/* Last Updated */}
          {lastUpdated && (
            <div className="text-center text-xs text-muted-foreground">
              Last updated {lastUpdated}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
