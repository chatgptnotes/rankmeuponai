'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Loader2, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface TrackingTriggerProps {
  brandId: string;
  brandName: string;
  totalPrompts: number;
}

interface TrackingResult {
  sessionId: string;
  status: 'completed' | 'failed';
  brandMentioned: boolean;
  position?: number;
  citationsCount: number;
  discoveredBrandsCount: number;
  error?: string;
}

interface TrackingSummary {
  total: number;
  completed: number;
  failed: number;
  mentioned: number;
  visibilityRate: number;
}

export function TrackingTrigger({ brandId, brandName, totalPrompts }: TrackingTriggerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [results, setResults] = useState<TrackingResult[] | null>(null);
  const [summary, setSummary] = useState<TrackingSummary | null>(null);

  const handleTrack = async () => {
    setIsTracking(true);
    setResults(null);
    setSummary(null);

    try {
      const response = await fetch('/api/tracking/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId,
          aiEngines: ['chatgpt'], // Start with ChatGPT only
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to track prompts');
      }

      const data = await response.json();
      setResults(data.results);
      setSummary(data.summary);

      toast.success(`Tracking complete! ${data.summary.mentioned} mentions found.`);
    } catch (error) {
      console.error('Tracking error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to track prompts');
    } finally {
      setIsTracking(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Track Brand Visibility</CardTitle>
          <CardDescription>
            Run AI tracking across all active prompts for {brandName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {totalPrompts} active prompt{totalPrompts !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-muted-foreground">
                Estimated time: {Math.ceil(totalPrompts * 2)} seconds
              </p>
            </div>
            <Button
              onClick={handleTrack}
              disabled={isTracking || totalPrompts === 0}
              size="lg"
            >
              {isTracking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Track Now
                </>
              )}
            </Button>
          </div>

          {summary && (
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/50 p-4 md:grid-cols-4">
              <div>
                <div className="text-2xl font-bold">{summary.total}</div>
                <div className="text-xs text-muted-foreground">Total Tracked</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-500">{summary.mentioned}</div>
                <div className="text-xs text-muted-foreground">Mentions</div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-2xl font-bold">{summary.visibilityRate.toFixed(1)}%</span>
                </div>
                <div className="text-xs text-muted-foreground">Visibility Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-500">{summary.failed}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {results && results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tracking Results</CardTitle>
            <CardDescription>Detailed results from each prompt</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    {result.status === 'completed' ? (
                      result.brandMentioned ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-orange-500" />
                      )
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Prompt {index + 1}</span>
                        {result.brandMentioned && result.position && (
                          <Badge variant="secondary">Position {result.position}</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.status === 'completed' ? (
                          <>
                            {result.citationsCount} citation{result.citationsCount !== 1 ? 's' : ''},{' '}
                            {result.discoveredBrandsCount} brand{result.discoveredBrandsCount !== 1 ? 's' : ''} discovered
                          </>
                        ) : (
                          result.error || 'Failed'
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      result.status === 'completed'
                        ? result.brandMentioned
                          ? 'default'
                          : 'secondary'
                        : 'destructive'
                    }
                  >
                    {result.status === 'completed'
                      ? result.brandMentioned
                        ? 'Mentioned'
                        : 'Not Mentioned'
                      : 'Failed'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
