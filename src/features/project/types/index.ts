export type ProjectListItem = {
  slug: string;
  title: string;
  description: string;
  createdTime: string;
};

export type ProjectListResponse = {
  items: ProjectListItem[];
};

export type ProjectFrontmatter = {
  title: string;
  slug: string;
  description: string;
  createdTime: string;
  lastEditedTime: string;
};

export type ProjectDetailMeta = {
  title: string;
  createdTime?: string;
  lastEditedTime?: string;
};

export type ProjectDetailResponse = {
  meta: ProjectDetailMeta;
  content: string;
};
