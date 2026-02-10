jest.mock('@/lib/api/notion', () => ({
  notion: {
    pages: {
      retrieve: jest.fn(),
    },
  },
}));

jest.mock('@/lib/api/notion-blocks', () => ({
  getNotionBlockChildrenRecursive: jest.fn(),
}));

import {getBlogDetail} from '../api/get-blog-detail';
import {notion} from '@/lib/api/notion';
import {getNotionBlockChildrenRecursive} from '@/lib/api/notion-blocks';

const mockRetrieve = notion.pages.retrieve as jest.Mock;
const mockGetBlocks = getNotionBlockChildrenRecursive as jest.Mock;

function makePage(id: string, title: string, categories: string[] = []) {
  return {
    id,
    last_edited_time: '2024-06-15T10:00:00Z',
    properties: {
      'Doc name': {
        type: 'title',
        title: [{plain_text: title}],
      },
      Category: {
        type: 'multi_select',
        multi_select: categories.map((name) => ({name})),
      },
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getBlogDetail', () => {
  it('fetches page and blocks in parallel', async () => {
    mockRetrieve.mockResolvedValue(makePage('page-id', 'My Post', ['Frontend']));
    mockGetBlocks.mockResolvedValue([{type: 'paragraph', id: 'block-1'}]);

    const result = await getBlogDetail('page-id');

    expect(result.meta.title).toBe('My Post');
    expect(result.meta.categories).toEqual(['Frontend']);
    expect(result.blocks).toHaveLength(1);
  });

  it('converts slug without dashes to page ID format', async () => {
    mockRetrieve.mockResolvedValue(makePage('12345678-1234-1234-1234-123456789012', 'Post'));
    mockGetBlocks.mockResolvedValue([]);

    await getBlogDetail('12345678123412341234123456789012');

    expect(mockRetrieve).toHaveBeenCalledWith({
      page_id: '12345678-1234-1234-1234-123456789012',
    });
  });

  it('keeps slug with dashes as-is', async () => {
    const id = '12345678-1234-1234-1234-123456789012';
    mockRetrieve.mockResolvedValue(makePage(id, 'Post'));
    mockGetBlocks.mockResolvedValue([]);

    await getBlogDetail(id);

    expect(mockRetrieve).toHaveBeenCalledWith({page_id: id});
  });

  it('returns Untitled when no title property exists', async () => {
    mockRetrieve.mockResolvedValue({
      id: 'p1',
      last_edited_time: '2024-01-01T00:00:00Z',
      properties: {Other: {type: 'rich_text', rich_text: []}},
    });
    mockGetBlocks.mockResolvedValue([]);

    const result = await getBlogDetail('p1');

    expect(result.meta.title).toBe('Untitled');
  });

  it('returns lastEditedTime in meta', async () => {
    mockRetrieve.mockResolvedValue(makePage('p1', 'Post'));
    mockGetBlocks.mockResolvedValue([]);

    const result = await getBlogDetail('p1');

    expect(result.meta.lastEditedTime).toBe('2024-06-15T10:00:00Z');
  });

  it('returns empty categories when no Category property', async () => {
    mockRetrieve.mockResolvedValue({
      id: 'p1',
      last_edited_time: '2024-01-01T00:00:00Z',
      properties: {
        'Doc name': {type: 'title', title: [{plain_text: 'Post'}]},
      },
    });
    mockGetBlocks.mockResolvedValue([]);

    const result = await getBlogDetail('p1');

    expect(result.meta.categories).toEqual([]);
  });
});
