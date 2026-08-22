'use client';

import {useSearchParams} from 'next/navigation';

import type {BlogListItem} from '@/lib/content/blog';

import {BlogContent} from './blog-content';
import {filterBlogPosts} from '../_lib/filter-posts';

type Props = {
  posts: BlogListItem[];
  emptyText: string;
};

export function BlogFilteredContent({posts, emptyText}: Props) {
  const searchParams = useSearchParams();

  const filtered = filterBlogPosts(posts, {
    q: searchParams.get('q') ?? undefined,
    category: searchParams.get('category') ?? undefined,
  });

  return <BlogContent posts={filtered} emptyText={emptyText} />;
}
