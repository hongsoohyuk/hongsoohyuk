'use client';

import {useIntersectionObserver} from '@/shared/lib/hooks/use-intersection-observer';

interface InfiniteFeedSentinelProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export function InfiniteFeedSentinel({onLoadMore, hasMore, isLoading}: InfiniteFeedSentinelProps) {
  const sentinelRef = useIntersectionObserver<HTMLDivElement>({
    onIntersect: () => {
      if (hasMore && !isLoading) {
        onLoadMore();
      }
    },
    rootMargin: '200px',
    enabled: hasMore && !isLoading,
  });

  return <div ref={sentinelRef} className="h-10" aria-hidden="true" />;
}
