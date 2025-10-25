'use client';

import {EndOfFeed, InfiniteFeedSentinel, LoadingSkeleton, PostGrid, PostItem} from '@/app/instagram/_components';
import {IG_FEED_STYLES} from '@/lib/constants/instagram';
import {useInstagramFeed} from '@/lib/hooks/instagram';
import {InstagramFeedOptions} from '@/lib/types/instagram';

interface InstagramFeedProps extends InstagramFeedOptions {
  columns?: 2 | 3 | 4;
}

export default function InstagramFeed({initialItems, initialAfter, pageSize = 12, columns = 3}: InstagramFeedProps) {
  const {items, isLoading, hasMore, loadMore} = useInstagramFeed({
    initialItems,
    initialAfter,
    pageSize,
  });

  return (
    <>
      <PostGrid columns={columns}>
        {items.map((post) => (
          <PostItem key={post.id} post={post} aspectRatioClass={IG_FEED_STYLES.itemAspectClass} />
        ))}
        {isLoading && <LoadingSkeleton count={pageSize / 4} aspectRatioClass={IG_FEED_STYLES.itemAspectClass} />}
      </PostGrid>

      <InfiniteFeedSentinel onLoadMore={loadMore} hasMore={hasMore} isLoading={isLoading} />

      {!hasMore && items.length > 0 && <EndOfFeed />}
    </>
  );
}
