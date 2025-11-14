'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LucideIcon, TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  tooltip?: string;
  isLoading?: boolean;
  className?: string;
  valueClassName?: string;
  iconColor?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  badge,
  tooltip,
  isLoading = false,
  className,
  valueClassName,
  iconColor = 'text-muted-foreground',
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;

    if (trend.value === 0) {
      return <Minus className="h-4 w-4 text-muted-foreground" />;
    }

    if (trend.isPositive ?? trend.value > 0) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }

    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const getTrendColor = () => {
    if (!trend) return 'text-muted-foreground';

    if (trend.value === 0) return 'text-muted-foreground';

    if (trend.isPositive ?? trend.value > 0) {
      return 'text-green-500';
    }

    return 'text-red-500';
  };

  return (
    <Card className={cn('transition-all hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {badge && (
            <Badge variant={badge.variant || 'secondary'} className="text-xs">
              {badge.label}
            </Badge>
          )}
        </div>
        {Icon && <Icon className={cn('h-4 w-4', iconColor)} />}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 w-24 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          </div>
        ) : (
          <>
            <div className={cn('text-2xl font-bold tabular-nums', valueClassName)}>
              {value}
            </div>
            {(description || trend) && (
              <div className="mt-1 flex items-center gap-2">
                {trend && (
                  <div className="flex items-center gap-1">
                    {getTrendIcon()}
                    <span className={cn('text-xs font-medium', getTrendColor())}>
                      {trend.value > 0 ? '+' : ''}{trend.value}%
                    </span>
                  </div>
                )}
                {description && (
                  <p className="text-xs text-muted-foreground">
                    {trend && <span className="mx-1">•</span>}
                    {description}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Loading skeleton component
export function StatsCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-8 w-20 bg-muted rounded animate-pulse" />
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}

// Preset stat card configurations for common metrics
export const STAT_CARD_PRESETS = {
  totalPrompts: (value: number, trend?: number) => ({
    title: 'Total Prompts',
    value,
    tooltip: 'Total number of prompts being tracked across all AI engines',
    trend: trend !== undefined ? { value: trend, label: 'from last period' } : undefined,
  }),

  avgVisibility: (value: number, trend?: number) => ({
    title: 'Avg Visibility',
    value: `${value}%`,
    tooltip: 'Average visibility score across all tracked prompts',
    trend: trend !== undefined ? { value: trend, label: 'from last period', isPositive: trend > 0 } : undefined,
  }),

  totalMentions: (value: number, trend?: number) => ({
    title: 'Total Mentions',
    value: value.toLocaleString(),
    tooltip: 'Total number of times your brand was mentioned in AI responses',
    trend: trend !== undefined ? { value: trend, label: 'from last period', isPositive: trend > 0 } : undefined,
  }),

  topRanking: (value: number) => ({
    title: 'Top Rankings',
    value,
    description: 'Prompts in top 3 positions',
    tooltip: 'Number of prompts where your brand appears in the top 3 results',
  }),
} as const;
