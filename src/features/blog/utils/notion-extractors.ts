import type {PageObjectResponse} from '@notionhq/client/build/src/api-endpoints';

import type {BlogCategory} from '../types';

export function extractTitle(page: PageObjectResponse): string {
  const props = page.properties;
  for (const value of Object.values(props)) {
    if (value.type === 'title') {
      return (value.title ?? []).map((t) => t.plain_text).join('');
    }
  }
  return 'Untitled';
}

export function extractCategories(page: PageObjectResponse): BlogCategory[] {
  const prop = page.properties['Category'];
  if (prop?.type === 'multi_select') {
    return prop.multi_select.map((s) => s.name) as BlogCategory[];
  }
  return [];
}

export function extractKeywords(page: PageObjectResponse): string[] {
  const prop = page.properties['Keywords'];
  if (prop?.type === 'multi_select') {
    return prop.multi_select.map((s) => s.name);
  }
  return [];
}

export function extractDescription(page: PageObjectResponse): string {
  const prop = page.properties['Description'];
  if (prop?.type === 'rich_text') {
    return prop.rich_text.map((t) => t.plain_text).join('');
  }
  return '';
}
