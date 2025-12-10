'use client';

import {getInstagramMedia, IG_FEED_CONFIG, InstagramFeedOptions} from '@/entities/instagram';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useMemo} from 'react';

export function useInstagramFeed(options: InstagramFeedOptions = {}) {
  const {initialItems = [], initialAfter, pageSize = IG_FEED_CONFIG.defaultPageSize} = options;

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
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: IG_FEED_CONFIG.staleTime,
  });

  const items = useMemo(() => query.data?.pages.flatMap((page) => page.data ?? []) ?? [], [query.data]);

  const hasMore = Boolean(query.data?.pages.at(-1)?.paging?.cursors?.after);

  return {
    items,
    isLoading: query.isFetching && !query.isFetchingNextPage,
    error: query.error ? (query.error as Error).message : null,
    hasMore,
    loadMore: () => query.fetchNextPage(),
  };
}
