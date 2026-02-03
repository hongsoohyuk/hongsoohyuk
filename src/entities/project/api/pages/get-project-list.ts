import {notion} from '@/lib/api/notion';
import {DEFAULT_PAGE, DEFAULT_PAGE_SIZE} from '@/lib/api/pagination';

import type {ProjectListItem, ProjectListResponse} from '../../model/types';
import type {
  BlockObjectResponse,
  PageObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

const INTRO_PAGE_ID = '1e8cc5bea79e80018f4df4db8dcf96ae';

type GetProjectListParams = {
  page?: number;
  pageSize?: number;
};

function extractCoverUrl(page: PageObjectResponse): string | undefined {
  if (!page.cover) return undefined;
  if (page.cover.type === 'external') return page.cover.external.url;
  if (page.cover.type === 'file') return page.cover.file.url;
  return undefined;
}

function extractIconUrl(page: PageObjectResponse): string | undefined {
  if (!page.icon) return undefined;
  if (page.icon.type === 'emoji') return page.icon.emoji;
  if (page.icon.type === 'external') return page.icon.external.url;
  if (page.icon.type === 'file') return page.icon.file.url;
  return undefined;
}

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

  const items: ProjectListItem[] = await Promise.all(
    paginatedPages.map(async (block) => {
      const pageDetail = (await notion.pages.retrieve({
        page_id: block.id,
      })) as PageObjectResponse;

      return {
        id: block.id,
        slug: block.id.replace(/-/g, ''),
        title: (block as any).child_page?.title ?? 'Untitled',
        cover: extractCoverUrl(pageDetail),
        icon: extractIconUrl(pageDetail),
        createdTime: pageDetail.created_time,
      };
    })
  );

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
