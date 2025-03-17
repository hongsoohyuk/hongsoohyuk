import {cache} from 'react';

import {notion} from '@/lib/api/notion';
import {getNotionBlockChildrenRecursive} from '@/lib/api/notion-blocks';

import type {BlogDetailResponse} from '../types';
import type {PageObjectResponse} from '@notionhq/client/build/src/api-endpoints';
import {extractCategories, extractKeywords, extractTitle} from '../utils/notion-extractors';

function slugToPageId(slug: string): string {
  if (slug.includes('-')) return slug;
  return slug.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
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
