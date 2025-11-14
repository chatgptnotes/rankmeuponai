'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Topic {
  id: string;
  name: string;
  promptCount: number;
  visibilityScore: number;
  trend?: number; // percentage change
  mentions: number;
  category?: string;
}

interface TrendingTopicsCardProps {
  topics: Topic[];
  isLoading?: boolean;
  className?: string;
  showViewAll?: boolean;
}

export function TrendingTopicsCard({
  topics,
  isLoading = false,
  className,
  showViewAll = true,
}: TrendingTopicsCardProps) {
  const getTrendIcon = (trend?: number) => {
    if (!trend) return <Minus className="h-4 w-4 text-muted-foreground" />;
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = (trend?: number) => {
    if (!trend) return 'text-muted-foreground';
    if (trend > 0) return 'text-green-500';
    if (trend < 0) return 'text-red-500';
    return 'text-muted-foreground';
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-5 w-40 bg-muted rounded animate-pulse" />
          <div className="h-4 w-56 bg-muted rounded animate-pulse mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-5 w-48 bg-muted rounded animate-pulse" />
                <div className="h-2 w-full bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('transition-all hover:shadow-lg', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trending Topics</CardTitle>
            <CardDescription>
              Top performing topic clusters by visibility
            </CardDescription>
          </div>
          {showViewAll && topics.length > 0 && (
            <Link
              href="/topics"
              className="text-sm text-primary hover:underline font-medium"
            >
              View All
            </Link>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topics.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center">
              <Tag className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No topics yet. Create topic clusters to organize your prompts.
              </p>
            </div>
          ) : (
            topics.slice(0, 5).map((topic, index) => (
              <div
                key={topic.id}
                className="group rounded-lg border border-border p-4 transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                      <Link
                        href={`/topics/${topic.id}`}
                        className="truncate font-medium hover:text-primary transition-colors"
                      >
                        {topic.name}
                      </Link>
                    </div>
                    {topic.category && (
                      <Badge variant="secondary" className="text-xs">
                        {topic.category}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {getTrendIcon(topic.trend)}
                    {topic.trend !== undefined && topic.trend !== 0 && (
                      <span className={cn('text-xs font-medium tabular-nums', getTrendColor(topic.trend))}>
                        {topic.trend > 0 ? '+' : ''}{topic.trend}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="mb-3 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold tabular-nums">
                      {topic.promptCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Prompts</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold tabular-nums">
                      {topic.mentions}
                    </div>
                    <div className="text-xs text-muted-foreground">Mentions</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold tabular-nums">
                      {Math.round(topic.visibilityScore)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Visibility</div>
                  </div>
                </div>

                {/* Visibility Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Visibility Score</span>
                    <span className="font-medium">{Math.round(topic.visibilityScore)}%</span>
                  </div>
                  <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        'h-full transition-all',
                        getScoreColor(topic.visibilityScore)
                      )}
                      style={{ width: `${topic.visibilityScore}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
