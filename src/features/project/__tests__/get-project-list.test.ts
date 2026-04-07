jest.mock('react', () => ({
  ...jest.requireActual('react'),
  cache: (fn: Function) => fn,
}));

jest.mock('@/lib/markdown', () => ({
  getMarkdownFiles: jest.fn(),
}));

import {getMarkdownFiles} from '@/lib/markdown';
import {getProjectList} from '../api/pages/get-project-list';

import type {ProjectFrontmatter} from '../types';

const mockGetMarkdownFiles = getMarkdownFiles as jest.MockedFunction<typeof getMarkdownFiles>;

function makeFile(slug: string, frontmatter: Partial<ProjectFrontmatter>) {
  return {
    slug,
    frontmatter: {
      title: frontmatter.title ?? 'Untitled',
      slug,
      description: frontmatter.description ?? '',
      createdTime: frontmatter.createdTime ?? '2024-01-01T00:00:00Z',
      lastEditedTime: frontmatter.lastEditedTime ?? '2024-01-01T00:00:00Z',
    },
    content: '# Test',
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getProjectList', () => {
  it('returns items from markdown files', async () => {
    mockGetMarkdownFiles.mockResolvedValue([
      makeFile('project-1', {title: 'Project 1', description: 'Description 1'}),
    ]);

    const result = await getProjectList();

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Project 1');
    expect(result.items[0].description).toBe('Description 1');
    expect(result.items[0].slug).toBe('project-1');
  });

  it('returns empty items when no files', async () => {
    mockGetMarkdownFiles.mockResolvedValue([]);

    const result = await getProjectList();

    expect(result.items).toEqual([]);
  });

  it('sorts by createdTime descending', async () => {
    mockGetMarkdownFiles.mockResolvedValue([
      makeFile('old', {title: 'Old Project', createdTime: '2023-01-01T00:00:00Z'}),
      makeFile('new', {title: 'New Project', createdTime: '2024-06-01T00:00:00Z'}),
    ]);

    const result = await getProjectList();

    expect(result.items[0].title).toBe('New Project');
    expect(result.items[1].title).toBe('Old Project');
  });

  it('defaults empty description', async () => {
    mockGetMarkdownFiles.mockResolvedValue([
      makeFile('no-desc', {title: 'No Desc', description: undefined as any}),
    ]);

    const result = await getProjectList();

    expect(result.items[0].description).toBe('');
  });
});
