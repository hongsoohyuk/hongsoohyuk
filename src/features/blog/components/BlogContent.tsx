'use client';

import {useSearchParams} from 'next/navigation';

import {BlogPostCard} from './BlogPostCard';

import type {BlogCategory, BlogListItem} from '../types';

type Props = {
  posts: BlogListItem[];
  emptyText: string;
};

export function BlogContent({posts, emptyText}: Props) {
  const searchParams = useSearchParams();
  const q = searchParams?.get('q') ?? '';
  const category = searchParams?.get('category') ?? '';

  let filtered = posts;
  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter((p) => p.title.toLowerCase().includes(lower));
  }
  if (category) {
    filtered = filtered.filter((p) => p.categories.includes(category as BlogCategory));
  }

  return (
    <div className="flex flex-col">
      {filtered.map((post) => (
        <BlogPostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
