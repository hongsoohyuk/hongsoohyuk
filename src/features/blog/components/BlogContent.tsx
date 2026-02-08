'use client';

import {useMemo} from 'react';
import {useSearchParams} from 'next/navigation';

import {BlogPostCard} from './BlogPostCard';

import type {BlogCategory, BlogListItem} from '../types';

type Props = {
  posts: BlogListItem[];
  emptyText: string;
};

export function BlogContent({posts, emptyText}: Props) {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';

  const filtered = useMemo(() => {
    let result = posts;
    if (q) {
      const lower = q.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(lower));
    }
    if (category) {
      result = result.filter((p) => p.categories.includes(category as BlogCategory));
    }
    return result;
  }, [posts, q, category]);

  return filtered.length > 0 ? (
    <div className="flex flex-col">
      {filtered.map((post) => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </div>
  ) : (
    <p className="text-muted-foreground py-12">{emptyText}</p>
  );
}
