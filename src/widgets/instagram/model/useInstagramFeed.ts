import {fetchInstagramPostList, queryKeyFactory} from '@/entities/instagram';
import {InstagramFeedOptions} from '@/entities/instagram/model/types';
import {useInfiniteQuery} from '@tanstack/react-query';

export function useInstagramFeed(props: InstagramFeedOptions) {
  const query = useInfiniteQuery({
    queryKey: queryKeyFactory.infiniteListMedia(),
    queryFn: async ({pageParam}: {pageParam?: string}) => {
      const nextPageAfter = pageParam;
      return fetchInstagramPostList({after: nextPageAfter});
    },
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.paging?.cursors?.after,
    initialData: {
      pageParams: [undefined],
      pages: [{data: props.initialItems ?? [], paging: {cursors: {after: props.initialAfter ?? undefined}}}],
    },
  });

  const items = query.data?.pages.flatMap((page) => page.data ?? []) ?? [];

  return {
    items,
    isLoading: query.isFetching && !query.isFetchingNextPage,
    error: query.error ? (query.error as Error).message : null,
    hasMore: query.hasNextPage,
    loadMore: () => query.fetchNextPage(),
  };
}
