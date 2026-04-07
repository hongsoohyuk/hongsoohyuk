import {cache} from 'react';

import {getMarkdownFile} from '@/lib/markdown';

import type {ProjectDetailResponse, ProjectFrontmatter} from '../../types';

export const getProjectDetail = cache(async function getProjectDetail(slug: string): Promise<ProjectDetailResponse> {
  const file = await getMarkdownFile<ProjectFrontmatter>('project', slug);

  return {
    meta: {
      title: file.frontmatter.title,
      createdTime: file.frontmatter.createdTime,
      lastEditedTime: file.frontmatter.lastEditedTime,
    },
    content: file.content,
  };
});
