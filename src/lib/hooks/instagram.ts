'use client';

import {getInstagramMedia} from '@/lib/api/instagram';
import {InstagramMedia} from '@/lib/types';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useEffect, useMemo} from 'react';

interface UseInstagramFeedOptions {
  initialItems?: InstagramMedia[];
  initialAfter?: string;
  pageSize?: number;
}

export function useInstagramFeed(options: UseInstagramFeedOptions = {}) {
  const {initialItems = [], initialAfter, pageSize = 12} = options;

  const query = useInfiniteQuery({
    queryKey: ['instagram', pageSize],
    queryFn: async ({pageParam}) => getInstagramMedia({after: pageParam as string | undefined, limit: pageSize}),
    initialPageParam: initialAfter,
    getNextPageParam: (lastPage) => lastPage.paging?.cursors?.after,
    initialData: initialItems.length
      ? {
          pageParams: [undefined],
          pages: [
            {
              data: initialItems,
              paging: {cursors: {after: initialAfter}},
            },
          ],
        }
      : undefined,
    // Prevent replacing SSR data on mount
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 60 * 1000,
  });

  const items = useMemo(() => query.data?.pages.flatMap((p) => p.data ?? []) ?? [], [query.data]);

  const hasMore = Boolean(query.data?.pages.at(-1)?.paging?.cursors?.after);

  useEffect(() => {
    // If there are no initial items but we have initialAfter, hydrate first page to avoid extra request
  }, []);

  return {
    items,
    isLoading: query.isFetching && !query.isFetchingNextPage,
    error: query.error ? (query.error as Error).message : null,
    hasMore,
    loadMore: () => query.fetchNextPage(),
  };
}
