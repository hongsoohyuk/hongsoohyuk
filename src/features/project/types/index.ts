// Re-export shared Notion type
export type {NotionBlockWithChildren} from '@/types/notion';

export type ProjectListItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  createdTime: string;
};

export type ProjectListResponse = {
  items: ProjectListItem[];
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
