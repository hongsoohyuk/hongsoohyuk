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
  categories: BlogCategory[];
  excerpt: string;
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
    lastEditedTime: string;
  };
  blocks: NotionBlockWithChildren[];
};
