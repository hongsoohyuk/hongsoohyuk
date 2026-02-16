import {NotionBlockWithChildren} from '@/types/notion';

export type {NotionBlockWithChildren} from '@/types/notion';

export type BlogCategory =
  | 'Software Architecture'
  | 'Book'
  | 'Retrospective'
  | 'Study'
  | 'Frontend'
  | 'Infrastucture'
  | 'Backend';

export const BLOG_CATEGORIES: BlogCategory[] = [
  'Software Architecture',
  'Book',
  'Retrospective',
  'Study',
  'Frontend',
  'Infrastucture',
  'Backend',
];

export type BlogListItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  categories: BlogCategory[];
  keywords: string[];
  lastEditedTime: string;
};

export type BlogListResponse = {
  items: BlogListItem[];
};

export type BlogDetailResponse = {
  meta: {
    id: string;
    title: string;
    categories: BlogCategory[];
    keywords: string[];
    lastEditedTime: string;
  };
  blocks: NotionBlockWithChildren[];
};
