jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: Function) => fn,
}));

jest.mock('@/lib/markdown', () => ({
  getMarkdownFiles: jest.fn(),
}));

import {getMarkdownFiles} from '@/lib/markdown';
import {getBlogList} from '../api/get-blog-list';

import type {BlogFrontmatter} from '../types';

const mockGetMarkdownFiles = getMarkdownFiles as jest.MockedFunction<typeof getMarkdownFiles>;

function makeFile(slug: string, frontmatter: Partial<BlogFrontmatter>) {
  return {
    slug,
    frontmatter: {
      title: frontmatter.title ?? 'Untitled',
      slug,
      description: frontmatter.description ?? '',
      categories: frontmatter.categories ?? [],
      keywords: frontmatter.keywords ?? [],
      createdTime: frontmatter.createdTime ?? '2024-01-01T00:00:00Z',
      lastEditedTime: frontmatter.lastEditedTime ?? '2024-01-01T00:00:00Z',
    },
    content: '# Test',
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getBlogList', () => {
  it('returns items from markdown files', async () => {
    mockGetMarkdownFiles.mockResolvedValue([makeFile('post-1', {title: 'First Post', categories: ['Frontend']})]);

    const result = await getBlogList();

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('First Post');
    expect(result.items[0].slug).toBe('post-1');
    expect(result.items[0].categories).toEqual(['Frontend']);
  });

  it('returns empty items when no files', async () => {
    mockGetMarkdownFiles.mockResolvedValue([]);

    const result = await getBlogList();

    expect(result.items).toEqual([]);
  });

  it('filters by search query (case-insensitive)', async () => {
    mockGetMarkdownFiles.mockResolvedValue([
      makeFile('post-1', {title: 'React Hooks Guide'}),
      makeFile('post-2', {title: 'Vue Composition API'}),
    ]);

    const result = await getBlogList({q: 'react'});

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('React Hooks Guide');
  });

  it('filters by category', async () => {
    mockGetMarkdownFiles.mockResolvedValue([
      makeFile('post-1', {title: 'Post A', categories: ['Frontend']}),
      makeFile('post-2', {title: 'Post B', categories: ['Backend']}),
    ]);

    const result = await getBlogList({category: 'Frontend'});

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Post A');
  });

  it('combines search and category filters', async () => {
    mockGetMarkdownFiles.mockResolvedValue([
      makeFile('post-1', {title: 'React Post', categories: ['Frontend']}),
      makeFile('post-2', {title: 'React Backend', categories: ['Backend']}),
      makeFile('post-3', {title: 'Vue Post', categories: ['Frontend']}),
    ]);

    const result = await getBlogList({q: 'react', category: 'Frontend'});

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('React Post');
  });

  it('sorts by lastEditedTime descending', async () => {
    mockGetMarkdownFiles.mockResolvedValue([
      makeFile('old', {title: 'Old Post', lastEditedTime: '2024-01-01T00:00:00Z'}),
      makeFile('new', {title: 'New Post', lastEditedTime: '2024-06-01T00:00:00Z'}),
    ]);

    const result = await getBlogList();

    expect(result.items[0].title).toBe('New Post');
    expect(result.items[1].title).toBe('Old Post');
  });
});
