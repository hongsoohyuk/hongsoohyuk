'use client';

import {useIntersectionObserver} from '@/shared/lib/hooks/use-intersection-observer';

interface InfiniteFeedSentinelProps {
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
}

export function InfiniteListTrigger({onLoadMore, hasMore, isLoading}: InfiniteFeedSentinelProps) {
  const ref = useIntersectionObserver<HTMLDivElement>({
    onIntersect: () => {
      if (hasMore && !isLoading) onLoadMore();
    },
    rootMargin: '200px',
    enabled: hasMore && !isLoading,
  });

  return <div ref={ref} aria-hidden="true" />;
}
