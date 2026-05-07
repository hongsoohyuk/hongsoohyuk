import {BlogPostCard} from './blog-post-card';

import type {BlogListItem} from '@/lib/content/blog';

type Props = {
  posts: BlogListItem[];
  emptyText: string;
};

export function BlogContent({posts, emptyText}: Props) {
  if (posts.length === 0) return <p className="text-center text-muted-foreground py-8">{emptyText}</p>;

  return (
    <div className="flex flex-col">
      {posts.map((post) => (
        <BlogPostCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
