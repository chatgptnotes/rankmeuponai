'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TrendingUp, Award, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Citation {
  id: string;
  domain: string;
  title: string;
  snippet: string;
  position: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  relevanceScore: number;
}

interface CitationsCardProps {
  citations: Citation[];
  totalCitations: number;
  topDomains?: Array<{ domain: string; count: number }>;
  isLoading?: boolean;
  className?: string;
}

export function CitationsCard({
  citations,
  totalCitations,
  topDomains,
  isLoading = false,
  className,
}: CitationsCardProps) {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'negative':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

  const getSentimentIcon = (position: number) => {
    if (position <= 3) return <Award className="h-3 w-3" />;
    if (position <= 5) return <TrendingUp className="h-3 w-3" />;
    return null;
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          <div className="h-4 w-48 bg-muted rounded animate-pulse mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
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
            <CardTitle>Citations</CardTitle>
            <CardDescription>
              {totalCitations} citations from {topDomains?.length || 0} domains
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalCitations}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Top Domains */}
          {topDomains && topDomains.length > 0 && (
            <div className="rounded-lg bg-accent/50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                <LinkIcon className="h-4 w-4" />
                <span>Top Domains</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {topDomains.slice(0, 5).map((domain, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {domain.domain}
                    <span className="text-xs text-muted-foreground">({domain.count})</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Recent Citations */}
          <div className="space-y-3">
            <div className="text-sm font-medium">Recent Citations</div>
            {citations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No citations yet. Start tracking prompts to see brand mentions.
                </p>
              </div>
            ) : (
              citations.slice(0, 3).map((citation) => (
                <div
                  key={citation.id}
                  className="group rounded-lg border border-border p-3 transition-all hover:border-primary/50 hover:shadow-md"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">
                          {citation.title}
                        </span>
                        {getSentimentIcon(citation.position)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <a
                          href={`https://${citation.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          {citation.domain}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="text-xs text-muted-foreground">
                          Position #{citation.position}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn('text-xs capitalize', getSentimentColor(citation.sentiment))}
                    >
                      {citation.sentiment}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {citation.snippet}
                  </p>
                  {citation.relevanceScore > 0 && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${citation.relevanceScore * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {Math.round(citation.relevanceScore * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
