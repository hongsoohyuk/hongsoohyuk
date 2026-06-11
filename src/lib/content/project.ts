import {cache} from 'react';

import {getMarkdownFile, getMarkdownFiles} from '@/lib/markdown';

export type ProjectListItem = {
  slug: string;
  title: string;
  description: string;
  createdTime: string;
};

export type ProjectListResponse = {
  items: ProjectListItem[];
};

export type ProjectFrontmatter = {
  title: string;
  slug: string;
  description: string;
  createdTime: string;
  lastEditedTime: string;
};

export type ProjectDetailMeta = {
  title: string;
  description?: string;
  createdTime?: string;
  lastEditedTime?: string;
};

export type ProjectDetailResponse = {
  meta: ProjectDetailMeta;
  content: string;
};

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

export const getProjectDetail = cache(async function getProjectDetail(slug: string): Promise<ProjectDetailResponse> {
  const file = await getMarkdownFile<ProjectFrontmatter>('project', slug);

  return {
    meta: {
      title: file.frontmatter.title,
      description: file.frontmatter.description ?? '',
      createdTime: file.frontmatter.createdTime,
      lastEditedTime: file.frontmatter.lastEditedTime,
    },
    content: file.content,
  };
});
