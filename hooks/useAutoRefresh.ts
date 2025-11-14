'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

interface UseAutoRefreshOptions {
  /**
   * Query keys to refresh. Can be a single key or array of keys.
   * Example: 'brands' or ['brands', { includeStats: true }]
   */
  queryKey: string | readonly unknown[];

  /**
   * Interval in milliseconds. Default is 5 minutes (300000ms).
   */
  interval?: number;

  /**
   * Whether auto-refresh is enabled. Default is true.
   */
  enabled?: boolean;

  /**
   * Only refresh when the window/tab is focused. Default is true.
   */
  onlyWhenFocused?: boolean;
}

/**
 * Hook to automatically refresh React Query data at specified intervals
 *
 * @example
 * useAutoRefresh({
 *   queryKey: ['brands', { includeStats: true }],
 *   interval: 60000, // 1 minute
 *   enabled: true,
 * });
 */
export function useAutoRefresh({
  queryKey,
  interval = 300000, // 5 minutes default
  enabled = true,
  onlyWhenFocused = true,
}: UseAutoRefreshOptions) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      // Clear interval if disabled
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const refresh = () => {
      // Check if we should refresh based on focus
      if (onlyWhenFocused && document.hidden) {
        return;
      }

      // Invalidate queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: queryKey as any });
    };

    // Set up interval
    intervalRef.current = setInterval(refresh, interval);

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [queryKey, interval, enabled, onlyWhenFocused, queryClient]);

  // Manual refresh function
  const manualRefresh = () => {
    queryClient.invalidateQueries({ queryKey: queryKey as any });
  };

  return { refresh: manualRefresh };
}
