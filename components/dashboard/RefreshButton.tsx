'use client';

import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void;
  isRefreshing?: boolean;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

export function RefreshButton({
  onRefresh,
  isRefreshing: externalRefreshing,
  className,
  variant = 'outline',
  size = 'sm',
  showLabel = false,
}: RefreshButtonProps) {
  const [internalRefreshing, setInternalRefreshing] = useState(false);

  const isRefreshing = externalRefreshing ?? internalRefreshing;

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setInternalRefreshing(true);

    try {
      await onRefresh();
      toast.success('Data refreshed successfully');
    } catch (error) {
      console.error('Refresh error:', error);
      toast.error('Failed to refresh data');
    } finally {
      setInternalRefreshing(false);
    }
  };

  return (
    <Button
      onClick={handleRefresh}
      disabled={isRefreshing}
      variant={variant}
      size={size}
      className={cn('gap-2', className)}
    >
      <RefreshCw
        className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
      />
      {showLabel && <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>}
    </Button>
  );
}
