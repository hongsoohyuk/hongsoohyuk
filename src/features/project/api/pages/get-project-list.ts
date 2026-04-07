import {cache} from 'react';

import {getMarkdownFiles} from '@/lib/markdown';

import type {ProjectFrontmatter, ProjectListItem, ProjectListResponse} from '../../types';

export const getProjectList = cache(async function getProjectList(): Promise<ProjectListResponse> {
  const files = await getMarkdownFiles<ProjectFrontmatter>('project');

  const items: ProjectListItem[] = files
    .map((file) => ({
      slug: file.slug,
      title: file.frontmatter.title,
      description: file.frontmatter.description ?? '',
      createdTime: file.frontmatter.createdTime,
    }))
    .sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime());

  return {items};
});
