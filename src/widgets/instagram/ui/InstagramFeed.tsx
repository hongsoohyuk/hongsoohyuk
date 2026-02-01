import {FeedItem} from '@/features/instagram/ui/FeedItem';

import {InstagramMedia} from '@/entities/instagram/model/types';

export function InstagramFeed({items}: {items: InstagramMedia[]}) {
  return (
    <section className={'grid gap-0.5 grid-cols-3 lg:grid-cols-4 '} role="feed">
      {items.map((post) => (
        <FeedItem key={post.id} post={post} />
      ))}
    </section>
  );
}
