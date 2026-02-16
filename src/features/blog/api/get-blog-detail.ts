import {cache} from 'react';

import {notion} from '@/lib/api/notion';
import {getNotionBlockChildrenRecursive} from '@/lib/api/notion-blocks';

import type {BlogCategory, BlogDetailResponse} from '../types';
import type {PageObjectResponse} from '@notionhq/client/build/src/api-endpoints';

function slugToPageId(slug: string): string {
  if (slug.includes('-')) return slug;
  return slug.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}

function extractTitle(page: PageObjectResponse): string {
  const props = page.properties;
  for (const value of Object.values(props)) {
    if (value.type === 'title') {
      return (value.title ?? []).map((t) => t.plain_text).join('');
    }
  }
  return 'Untitled';
}

function extractCategories(page: PageObjectResponse): BlogCategory[] {
  const prop = page.properties['Category'];
  if (prop?.type === 'multi_select') {
    return prop.multi_select.map((s) => s.name) as BlogCategory[];
  }
  return [];
}

function extractKeywords(page: PageObjectResponse): string[] {
  const prop = page.properties['Keywords'];
  if (prop?.type === 'multi_select') {
    return prop.multi_select.map((s) => s.name);
  }
  return [];
}

export const getBlogDetail = cache(async function getBlogDetail(slug: string): Promise<BlogDetailResponse> {
  const pageId = slugToPageId(slug);

  const [page, blocks] = await Promise.all([
    notion.pages.retrieve({page_id: pageId}) as Promise<PageObjectResponse>,
    getNotionBlockChildrenRecursive(pageId),
  ]);

  return {
    meta: {
      id: page.id,
      title: extractTitle(page),
      categories: extractCategories(page),
      keywords: extractKeywords(page),
      lastEditedTime: page.last_edited_time,
    },
    blocks,
  };
});
