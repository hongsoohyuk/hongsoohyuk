import {notion} from '@/lib/api/notion';

import type {BlogCategory, BlogListItem, BlogListResponse} from '../types';
import type {BlockObjectResponse, PageObjectResponse} from '@notionhq/client/build/src/api-endpoints';

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

async function fetchExcerpt(pageId: string): Promise<string> {
  try {
    const response = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 5,
    });

    const blocks = response.results as BlockObjectResponse[];

    for (const block of blocks) {
      if (block.type === 'paragraph' && block.paragraph.rich_text.length > 0) {
        const text = block.paragraph.rich_text.map((t) => t.plain_text).join('');
        return text.slice(0, 200);
      }
      if (block.type === 'heading_1' || block.type === 'heading_2' || block.type === 'heading_3') {
        const richText = block[block.type].rich_text;
        if (richText.length > 0) {
          const text = richText.map((t) => t.plain_text).join('');
          return text.slice(0, 200);
        }
      }
      if (block.type === 'callout' && block.callout.rich_text.length > 0) {
        const text = block.callout.rich_text.map((t) => t.plain_text).join('');
        return text.slice(0, 200);
      }
    }
  } catch {
    // Silently fail - excerpt is non-critical
  }
  return '';
}

export async function getBlogList(params: GetBlogListParams = {}): Promise<BlogListResponse> {
  const filter = buildFilter(params);

  const response = await notion.dataSources.query({
    data_source_id: BLOG_DATA_SOURCE_ID,
    filter,
    sorts: [{property: 'Last updated time', direction: 'descending'}],
  });

  const pages = response.results as PageObjectResponse[];

  const items: BlogListItem[] = await Promise.all(
    pages.map(async (page) => {
      const excerpt = await fetchExcerpt(page.id);

      return {
        id: page.id,
        slug: page.id.replace(/-/g, ''),
        title: extractTitle(page),
        categories: extractCategories(page),
        excerpt,
        lastEditedTime: page.last_edited_time,
      };
    }),
  );

  return {items};
}
