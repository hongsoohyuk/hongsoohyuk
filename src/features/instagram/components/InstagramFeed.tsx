import {FeedItem} from './FeedItem';

import {InstagramMedia} from '../types';

export function InstagramFeed({items}: {items: InstagramMedia[]}) {
  return (
    <section className={'grid gap-0.5 grid-cols-3 lg:grid-cols-4 '} role="feed">
      {items.map((post) => (
        <FeedItem key={post.id} post={post} />
      ))}
    </section>
  );
}
