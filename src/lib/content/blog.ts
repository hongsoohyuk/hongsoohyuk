import 'server-only';

import {cache} from 'react';

import {getMarkdownFile, getMarkdownFiles} from '@/lib/markdown';

import type {BlogCategory} from './blog-categories';

export type {BlogCategory} from './blog-categories';
export {BLOG_CATEGORIES} from './blog-categories';

export type BlogVisibility = 'public' | 'private';

export type BlogListItem = {
  slug: string;
  title: string;
  description: string;
  categories: BlogCategory[];
  keywords: string[];
  lastEditedTime: string;
  visibility: BlogVisibility;
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
  visibility?: BlogVisibility;
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

function resolveVisibility(visibility: BlogVisibility | undefined): BlogVisibility {
  return visibility === 'private' ? 'private' : 'public';
}

export const getBlogList = cache(async function getBlogList(): Promise<BlogListResponse> {
  const files = await getMarkdownFiles<BlogFrontmatter>('blog');

  const items: BlogListItem[] = files.map((file) => ({
    slug: file.slug,
    title: file.frontmatter.title,
    description: file.frontmatter.description ?? '',
    categories: file.frontmatter.categories ?? [],
    keywords: file.frontmatter.keywords ?? [],
    lastEditedTime: file.frontmatter.lastEditedTime,
    visibility: resolveVisibility(file.frontmatter.visibility),
  }));

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
