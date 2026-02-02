import {getProjectDetail} from '../api/pages/get-project-detail';

// Mock dependencies
jest.mock('@/shared/api/notion', () => ({
  notion: {
    pages: {
      retrieve: jest.fn(),
    },
  },
}));

jest.mock('../api/blocks/get-block-children', () => ({
  getNotionBlockChildrenRecursive: jest.fn(),
}));

import {notion} from '@/shared/api/notion';
import {getNotionBlockChildrenRecursive} from '../api/blocks/get-block-children';

const mockPagesRetrieve = notion.pages.retrieve as jest.MockedFunction<typeof notion.pages.retrieve>;
const mockGetBlocks = getNotionBlockChildrenRecursive as jest.MockedFunction<typeof getNotionBlockChildrenRecursive>;

describe('getProjectDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPage = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    created_time: '2024-01-01T00:00:00.000Z',
    last_edited_time: '2024-01-15T12:00:00.000Z',
    properties: {
      title: {
        type: 'title',
        title: [{plain_text: 'Test Project'}],
      },
    },
    object: 'page',
    parent: {type: 'page_id', page_id: 'parent'},
    archived: false,
    in_trash: false,
    url: 'https://notion.so/test',
  };

  const mockBlocks = [
    {
      id: 'block-1',
      type: 'paragraph',
      paragraph: {rich_text: [{plain_text: 'Content'}]},
    },
  ];

  it('returns project detail with meta and blocks', async () => {
    mockPagesRetrieve.mockResolvedValue(mockPage as any);
    mockGetBlocks.mockResolvedValue(mockBlocks as any);

    const result = await getProjectDetail('123e4567e89b12d3a456426614174000');

    expect(result.meta.id).toBe('123e4567-e89b-12d3-a456-426614174000');
    expect(result.meta.title).toBe('Test Project');
    expect(result.meta.createdTime).toBe('2024-01-01T00:00:00.000Z');
    expect(result.meta.lastEditedTime).toBe('2024-01-15T12:00:00.000Z');
    expect(result.blocks).toEqual(mockBlocks);
  });

  it('converts slug to page ID format', async () => {
    mockPagesRetrieve.mockResolvedValue(mockPage as any);
    mockGetBlocks.mockResolvedValue([]);

    await getProjectDetail('123e4567e89b12d3a456426614174000');

    expect(mockPagesRetrieve).toHaveBeenCalledWith({
      page_id: '123e4567-e89b-12d3-a456-426614174000',
    });
  });

  it('handles slug that already contains hyphens', async () => {
    mockPagesRetrieve.mockResolvedValue(mockPage as any);
    mockGetBlocks.mockResolvedValue([]);

    await getProjectDetail('123e4567-e89b-12d3-a456-426614174000');

    expect(mockPagesRetrieve).toHaveBeenCalledWith({
      page_id: '123e4567-e89b-12d3-a456-426614174000',
    });
  });

  it('handles page without title property', async () => {
    const pageWithoutTitle = {
      ...mockPage,
      properties: {},
    };
    mockPagesRetrieve.mockResolvedValue(pageWithoutTitle as any);
    mockGetBlocks.mockResolvedValue([]);

    const result = await getProjectDetail('123e4567e89b12d3a456426614174000');

    expect(result.meta.title).toBe('Untitled');
  });

  it('handles page with empty title array', async () => {
    const pageWithEmptyTitle = {
      ...mockPage,
      properties: {
        title: {
          type: 'title',
          title: [],
        },
      },
    };
    mockPagesRetrieve.mockResolvedValue(pageWithEmptyTitle as any);
    mockGetBlocks.mockResolvedValue([]);

    const result = await getProjectDetail('123e4567e89b12d3a456426614174000');

    expect(result.meta.title).toBe('');
  });

  it('fetches page and blocks in parallel', async () => {
    mockPagesRetrieve.mockResolvedValue(mockPage as any);
    mockGetBlocks.mockResolvedValue(mockBlocks as any);

    await getProjectDetail('123e4567e89b12d3a456426614174000');

    // Both should be called (Promise.all)
    expect(mockPagesRetrieve).toHaveBeenCalledTimes(1);
    expect(mockGetBlocks).toHaveBeenCalledTimes(1);
  });

  it('propagates API errors', async () => {
    mockPagesRetrieve.mockRejectedValue(new Error('API Error'));
    mockGetBlocks.mockResolvedValue([]);

    await expect(getProjectDetail('invalid-slug')).rejects.toThrow('API Error');
  });
});
