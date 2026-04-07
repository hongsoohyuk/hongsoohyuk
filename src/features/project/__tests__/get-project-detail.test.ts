jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: Function) => fn,
}));

jest.mock('@/lib/markdown', () => ({
  getMarkdownFile: jest.fn(),
}));

import {getMarkdownFile} from '@/lib/markdown';
import {getProjectDetail} from '../api/pages/get-project-detail';

import type {ProjectFrontmatter} from '../types';

const mockGetMarkdownFile = getMarkdownFile as jest.MockedFunction<typeof getMarkdownFile>;

beforeEach(() => {
  jest.clearAllMocks();
});

const makeFrontmatter = (overrides: Partial<ProjectFrontmatter> = {}): ProjectFrontmatter => ({
  title: 'Test Project',
  slug: 'test-project',
  description: 'Test description',
  createdTime: '2024-01-01T00:00:00Z',
  lastEditedTime: '2024-01-15T12:00:00Z',
  ...overrides,
});

describe('getProjectDetail', () => {
  it('returns meta and content from markdown file', async () => {
    mockGetMarkdownFile.mockResolvedValue({
      slug: 'test-project',
      frontmatter: makeFrontmatter(),
      content: '# Project Content',
    });

    const result = await getProjectDetail('test-project');

    expect(result.meta.title).toBe('Test Project');
    expect(result.meta.createdTime).toBe('2024-01-01T00:00:00Z');
    expect(result.meta.lastEditedTime).toBe('2024-01-15T12:00:00Z');
    expect(result.content).toBe('# Project Content');
  });

  it('passes slug to getMarkdownFile', async () => {
    mockGetMarkdownFile.mockResolvedValue({
      slug: 'my-project',
      frontmatter: makeFrontmatter(),
      content: '',
    });

    await getProjectDetail('my-project');

    expect(mockGetMarkdownFile).toHaveBeenCalledWith('project', 'my-project');
  });

  it('propagates errors when file not found', async () => {
    mockGetMarkdownFile.mockRejectedValue(new Error('ENOENT: no such file'));

    await expect(getProjectDetail('nonexistent')).rejects.toThrow('ENOENT');
  });
});
