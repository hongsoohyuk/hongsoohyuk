'use client';

import {EndOfFeed, InfiniteFeedSentinel, LoadingSkeleton, PostDetailModal, PostGrid, PostItem} from '../_components';
import {IG_FEED_CONFIG, IG_FEED_STYLES, InstagramFeedOptions, InstagramMedia} from '@/entities/instagram';
import {useInstagramFeed} from '@/features/instagram/feed';
import {useCallback, useEffect, useState} from 'react';

interface InstagramFeedProps extends InstagramFeedOptions {
  columns?: 2 | 3 | 4;
}

export default function InstagramFeed({
  initialItems,
  initialAfter,
  pageSize = IG_FEED_CONFIG.defaultPageSize,
  columns = 3,
}: InstagramFeedProps) {
  const {items, isLoading, hasMore, loadMore} = useInstagramFeed({
    initialItems,
    initialAfter,
    pageSize,
  });
  const [selectedPost, setSelectedPost] = useState<InstagramMedia | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePostSelect = useCallback((post: InstagramMedia) => {
    setSelectedPost(post);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      return;
    }

    if (!selectedPost) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSelectedPost(null);
    }, 220);

    return () => window.clearTimeout(timeout);
  }, [isModalOpen, selectedPost]);

  return (
    <>
      <PostGrid columns={columns}>
        {items.map((post) => (
          <PostItem
            key={post.id}
            post={post}
            aspectRatioClass={IG_FEED_STYLES.itemAspectClass}
            onSelect={handlePostSelect}
          />
        ))}
        {isLoading && <LoadingSkeleton count={pageSize / 4} aspectRatioClass={IG_FEED_STYLES.itemAspectClass} />}
      </PostGrid>

      <InfiniteFeedSentinel onLoadMore={loadMore} hasMore={hasMore} isLoading={isLoading} />

      {!hasMore && items.length > 0 && <EndOfFeed />}

      <PostDetailModal post={selectedPost} open={isModalOpen} onClose={handleModalClose} />
    </>
  );
}
