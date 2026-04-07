import {cache} from 'react';

import {getMarkdownFile} from '@/lib/markdown';

import type {BlogDetailResponse, BlogFrontmatter} from '../types';

export const getBlogDetail = cache(async function getBlogDetail(slug: string): Promise<BlogDetailResponse> {
  const file = await getMarkdownFile<BlogFrontmatter>('blog', slug);

  return {
    meta: {
      title: file.frontmatter.title,
      categories: file.frontmatter.categories ?? [],
      keywords: file.frontmatter.keywords ?? [],
      lastEditedTime: file.frontmatter.lastEditedTime,
    },
    content: file.content,
  };
});
