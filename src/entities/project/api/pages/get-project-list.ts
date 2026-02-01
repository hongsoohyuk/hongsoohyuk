import {notion} from '@/shared/api/notion';
import {DEFAULT_PAGE, DEFAULT_PAGE_SIZE} from '@/shared/api/pagination';

import type {ProjectListItem, ProjectListResponse} from '../../model/types';
import type {BlockObjectResponse} from '@notionhq/client/build/src/api-endpoints';

const INTRO_PAGE_ID = '1e8cc5bea79e80018f4df4db8dcf96ae';

type GetProjectListParams = {
  page?: number;
  pageSize?: number;
};

export async function getProjectList(params: GetProjectListParams = {}): Promise<ProjectListResponse> {
  const {page = DEFAULT_PAGE, pageSize = DEFAULT_PAGE_SIZE} = params;

  const response = await notion.blocks.children.list({
    block_id: INTRO_PAGE_ID,
  });

  const blocks = response.results as BlockObjectResponse[];

  const childPages = blocks.filter((block): block is BlockObjectResponse & {type: 'child_page'} => {
    return block.type === 'child_page';
  });

  const totalItems = childPages.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const offset = (page - 1) * pageSize;

  const paginatedPages = childPages.slice(offset, offset + pageSize);

  const items: ProjectListItem[] = paginatedPages.map((block) => ({
    id: block.id,
    slug: block.id.replace(/-/g, ''),
    title: (block as any).child_page?.title ?? 'Untitled',
  }));

  return {
    items,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
    },
  };
}
