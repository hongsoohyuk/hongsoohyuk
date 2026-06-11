import 'server-only';

import {cache} from 'react';

import {getMarkdownFile, getMarkdownFiles} from '@/lib/markdown';

import type {BlogCategory} from './blog-categories';

export type {BlogCategory} from './blog-categories';
export {BLOG_CATEGORIES} from './blog-categories';

export type BlogListItem = {
  slug: string;
  title: string;
  description: string;
  categories: BlogCategory[];
  keywords: string[];
  lastEditedTime: string;
};

export type BlogListResponse = {
  items: BlogListItem[];
};

export type BlogFrontmatter = {
  title: string;
  slug: string;
  description: string;
  categories: BlogCategory[];
  keywords: string[];
  createdTime: string;
  lastEditedTime: string;
};

export type BlogDetailResponse = {
  meta: {
    title: string;
    description: string;
    categories: BlogCategory[];
    keywords: string[];
    createdTime: string;
    lastEditedTime: string;
  };
  content: string;
};

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

export const getBlogDetail = cache(async function getBlogDetail(slug: string): Promise<BlogDetailResponse> {
  const file = await getMarkdownFile<BlogFrontmatter>('blog', slug);

  return {
    meta: {
      title: file.frontmatter.title,
      description: file.frontmatter.description ?? '',
      categories: file.frontmatter.categories ?? [],
      keywords: file.frontmatter.keywords ?? [],
      createdTime: file.frontmatter.createdTime,
      lastEditedTime: file.frontmatter.lastEditedTime,
    },
    content: file.content,
  };
});
