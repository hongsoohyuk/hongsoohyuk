import {BlogPostCard} from './BlogPostCard';

import type {BlogListItem} from '../types';

type Props = {
  posts: BlogListItem[];
  emptyText: string;
};

export function BlogContent({posts, emptyText}: Props) {
  if (posts.length === 0) {
    return <p className="text-center text-muted-foreground py-8">{emptyText}</p>;
  }

  return (
    <div className="flex flex-col">
      {posts.map((post) => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
