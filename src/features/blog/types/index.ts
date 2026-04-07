export type BlogCategory =
  | 'Software Architecture'
  | 'Book'
  | 'Retrospective'
  | 'Study'
  | 'Frontend'
  | 'Infrastucture'
  | 'Backend'
  | 'Test';

export const BLOG_CATEGORIES: BlogCategory[] = [
  'Software Architecture',
  'Book',
  'Retrospective',
  'Study',
  'Frontend',
  'Infrastucture',
  'Backend',
  'Test',
];

export type BlogListItem = {
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

export type BlogFrontmatter = {
  title: string;
  slug: string;
  description: string;
  categories: BlogCategory[];
  keywords: string[];
  createdTime: string;
  lastEditedTime: string;
};

export type BlogDetailResponse = {
  meta: {
    title: string;
    categories: BlogCategory[];
    keywords: string[];
    lastEditedTime: string;
  };
  content: string;
};
