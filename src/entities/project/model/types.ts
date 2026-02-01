import type {BlockObjectResponse} from '@notionhq/client/build/src/api-endpoints';

export type NotionBlockWithChildren = BlockObjectResponse & {
  children?: NotionBlockWithChildren[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type ProjectListItem = {
  id: string;
  slug: string;
  title: string;
};

export type ProjectListResponse = {
  items: ProjectListItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

export type ProjectDetailMeta = {
  id: string;
  title: string;
  createdTime?: string;
  lastEditedTime?: string;
};

export type ProjectDetailResponse = {
  meta: ProjectDetailMeta;
  blocks: NotionBlockWithChildren[];
};
