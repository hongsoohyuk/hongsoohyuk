// Re-export shared Notion type
export type {NotionBlockWithChildren} from '@/types/notion';

export type ProjectListItem = {
  id: string;
  slug: string;
  title: string;
  cover?: string;
  icon?: string;
  createdTime: string;
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
