import {cache} from 'react';

import {notion} from '@/lib/api/notion';

import type {PageObjectResponse} from '@notionhq/client/build/src/api-endpoints';
import type {BlogListItem, BlogListResponse} from '../types';
import {extractCategories, extractDescription, extractKeywords, extractTitle} from '../utils/notion-extractors';

const BLOG_DATA_SOURCE_ID = '300cc5be-a79e-8080-a666-000b11188276';

type GetBlogListParams = {
  q?: string;
  category?: string;
};

function buildFilter(params: GetBlogListParams) {
  const conditions: any[] = [];

  if (params.q) {
    conditions.push({
      property: 'Doc name',
      title: {contains: params.q},
    });
  }

  if (params.category) {
    conditions.push({
      property: 'Category',
      multi_select: {contains: params.category},
    });
  }

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return {and: conditions};
}

export const getBlogList = cache(async function getBlogList(params: GetBlogListParams = {}): Promise<BlogListResponse> {
  const filter = buildFilter(params);

  const response = await notion.dataSources.query({
    data_source_id: BLOG_DATA_SOURCE_ID,
    filter,
  });

  const pages = response.results as PageObjectResponse[];

  const items: BlogListItem[] = pages.map((page) => ({
    id: page.id,
    slug: page.id.replace(/-/g, ''),
    title: extractTitle(page),
    description: extractDescription(page),
    categories: extractCategories(page),
    keywords: extractKeywords(page),
    lastEditedTime: page.last_edited_time,
  }));

  return {items};
});
