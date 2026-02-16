import {notion} from '@/lib/api/notion';

import type {PageObjectResponse} from '@notionhq/client/build/src/api-endpoints';
import type {ProjectListItem, ProjectListResponse} from '../../types';

const PROJECT_DATA_SOURCE_ID = 'e115e0c5-50a3-4f0c-b5ee-38195e53dcf7';

function extractTitle(page: PageObjectResponse): string {
  const props = page.properties;
  for (const value of Object.values(props)) {
    if (value.type === 'title') {
      return (value.title ?? []).map((t) => t.plain_text).join('');
    }
  }
  return 'Untitled';
}

function extractDescription(page: PageObjectResponse): string {
  const prop = page.properties['Description'];
  if (prop?.type === 'rich_text') {
    return prop.rich_text.map((t) => t.plain_text).join('');
  }
  return '';
}

export async function getProjectList(): Promise<ProjectListResponse> {
  const response = await notion.dataSources.query({
    data_source_id: PROJECT_DATA_SOURCE_ID,
  });

  const pages = response.results as PageObjectResponse[];

  const items: ProjectListItem[] = pages.map((page) => ({
    id: page.id,
    slug: page.id.replace(/-/g, ''),
    title: extractTitle(page),
    description: extractDescription(page),
    createdTime: page.created_time,
  }));

  return {items};
}
