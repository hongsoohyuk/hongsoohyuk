import React from 'react';

import {FeedItem} from './FeedItem';

import {InstagramMedia} from '../types';

const feedItemStyle: React.CSSProperties = {
  contentVisibility: 'auto',
  containIntrinsicSize: 'auto 0px',
};

export function InstagramFeed({items}: {items: InstagramMedia[]}) {
  return (
    <section className={'grid gap-0.5 grid-cols-3 lg:grid-cols-4 '} role="feed">
      {items.map((post, index) => (
        <div key={post.id} style={feedItemStyle}>
          <FeedItem post={post} priority={index < 8} />
        </div>
      ))}
    </section>
  );
}
