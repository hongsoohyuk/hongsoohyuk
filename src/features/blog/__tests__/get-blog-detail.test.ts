jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: Function) => fn,
}));

jest.mock('@/lib/markdown', () => ({
  getMarkdownFile: jest.fn(),
}));

import {getMarkdownFile} from '@/lib/markdown';
import {getBlogDetail} from '../api/get-blog-detail';

import type {BlogFrontmatter} from '../types';

const mockGetMarkdownFile = getMarkdownFile as jest.MockedFunction<typeof getMarkdownFile>;

beforeEach(() => {
  jest.clearAllMocks();
});

const makeFrontmatter = (overrides: Partial<BlogFrontmatter> = {}): BlogFrontmatter => ({
  title: 'Test Post',
  slug: 'test-post',
  description: 'Test description',
  categories: ['Frontend'],
  keywords: ['react'],
  createdTime: '2024-01-01T00:00:00Z',
  lastEditedTime: '2024-06-15T10:00:00Z',
  ...overrides,
});

describe('getBlogDetail', () => {
  it('returns meta and content from markdown file', async () => {
    mockGetMarkdownFile.mockResolvedValue({
      slug: 'test-post',
      frontmatter: makeFrontmatter(),
      content: '# Hello World',
    });

    const result = await getBlogDetail('test-post');

    expect(result.meta.title).toBe('Test Post');
    expect(result.meta.categories).toEqual(['Frontend']);
    expect(result.meta.keywords).toEqual(['react']);
    expect(result.meta.lastEditedTime).toBe('2024-06-15T10:00:00Z');
    expect(result.content).toBe('# Hello World');
  });

  it('passes slug to getMarkdownFile', async () => {
    mockGetMarkdownFile.mockResolvedValue({
      slug: 'my-post',
      frontmatter: makeFrontmatter(),
      content: '',
    });

    await getBlogDetail('my-post');

    expect(mockGetMarkdownFile).toHaveBeenCalledWith('blog', 'my-post');
  });

  it('defaults empty categories and keywords', async () => {
    mockGetMarkdownFile.mockResolvedValue({
      slug: 'test',
      frontmatter: makeFrontmatter({categories: undefined as any, keywords: undefined as any}),
      content: '',
    });

    const result = await getBlogDetail('test');

    expect(result.meta.categories).toEqual([]);
    expect(result.meta.keywords).toEqual([]);
  });
});
