'use client';
import {FeedItem} from '@/features/instagram';
import {InfiniteListTrigger} from '@/shared/ui/InfiniteListTrigger';
import {InstagramFeedOptions} from '@/entities/instagram/model/types';
import {useTranslations} from 'next-intl';
import {useInstagramFeed} from '../model/useInstagramFeed';
import { AspectRatio } from '@/shared/ui/aspect-ratio';
import { Skeleton } from '@/shared/ui/skeleton';

export function InstagramFeed(props: InstagramFeedOptions) {
  const {items, isLoading, hasMore, loadMore} = useInstagramFeed(props);

  return (
    <FeedGrid>
      {items.map((post) => (
        <FeedItem key={post.id} post={post} onSelect={() => {}} />
      ))}
      <InfiniteListTrigger onLoadMore={loadMore} hasMore={hasMore} isLoading={isLoading} />
      {isLoading && <LoadingSkeleton />}
      {!hasMore && items.length > 0 && <EndOfFeed />}
    </FeedGrid>
  );
}

function FeedGrid({children}: React.PropsWithChildren) {
  return (
    <div className={'grid gap-0.5 grid-cols-3'} role="feed">
      {children}
    </div>
  );
}

function EndOfFeed() {
  const t = useTranslations('Instagram');

  return (
    <div className="text-center py-4 text-sm text-muted-foreground" role="status">
      {t('endOfFeed')}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({length: 3}).map((_, index) => (
        <div key={`instagram-post-loading-${index}`} className="relative overflow-hidden">
          <AspectRatio ratio={4 / 5} className="relative w-full">
            <Skeleton aria-label="Loading post" className="absolute inset-0 h-full w-full" />
          </AspectRatio>
        </div>
      ))}
    </>
  );
}
