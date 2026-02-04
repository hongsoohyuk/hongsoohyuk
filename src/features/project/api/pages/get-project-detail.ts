import {notion} from '@/lib/api/notion';

import {getNotionBlockChildrenRecursive} from '../blocks/get-block-children';

import type {ProjectDetailMeta, ProjectDetailResponse} from '../../types';
import type {PageObjectResponse} from '@notionhq/client/build/src/api-endpoints';

function slugToPageId(slug: string): string {
  if (slug.includes('-')) {
    return slug;
  }
  return slug.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}

function extractTitle(page: PageObjectResponse): string {
  const props = page.properties ?? {};
  for (const value of Object.values(props)) {
    if (value.type === 'title') {
      return (value.title ?? []).map((t) => t.plain_text).join('');
    }
  }
  return 'Untitled';
}

export async function getProjectDetail(slug: string): Promise<ProjectDetailResponse> {
  const pageId = slugToPageId(slug);

  const [page, blocks] = await Promise.all([
    notion.pages.retrieve({page_id: pageId}) as Promise<PageObjectResponse>,
    getNotionBlockChildrenRecursive(pageId),
  ]);

  const meta: ProjectDetailMeta = {
    id: page.id,
    title: extractTitle(page),
    createdTime: page.created_time,
    lastEditedTime: page.last_edited_time,
  };

  return {
    meta,
    blocks,
  };
}
