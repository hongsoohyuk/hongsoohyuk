import {cache} from 'react';

import {getMarkdownFiles} from '@/lib/markdown';

import type {BlogFrontmatter, BlogListItem, BlogListResponse} from '../types';

type GetBlogListParams = {
  q?: string;
  category?: string;
};

export const getBlogList = cache(async function getBlogList(params: GetBlogListParams = {}): Promise<BlogListResponse> {
  const files = await getMarkdownFiles<BlogFrontmatter>('blog');

  let items: BlogListItem[] = files.map((file) => ({
    slug: file.slug,
    title: file.frontmatter.title,
    description: file.frontmatter.description ?? '',
    categories: file.frontmatter.categories ?? [],
    keywords: file.frontmatter.keywords ?? [],
    lastEditedTime: file.frontmatter.lastEditedTime,
  }));

  if (params.q) {
    const query = params.q.toLowerCase();
    items = items.filter((item) => item.title.toLowerCase().includes(query));
  }

  if (params.category) {
    items = items.filter((item) => item.categories.includes(params.category as BlogListItem['categories'][number]));
  }

  items.sort((a, b) => new Date(b.lastEditedTime).getTime() - new Date(a.lastEditedTime).getTime());

  return {items};
});
