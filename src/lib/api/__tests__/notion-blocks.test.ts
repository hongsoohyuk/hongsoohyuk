jest.mock('@/lib/api/notion', () => ({
  notion: {
    blocks: {
      children: {
        list: jest.fn(),
      },
    },
  },
}));

import {getNotionBlockChildren, getNotionBlockChildrenRecursive} from '../notion-blocks';
import {notion} from '@/lib/api/notion';

const mockList = notion.blocks.children.list as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getNotionBlockChildren', () => {
  it('calls notion API with block_id', async () => {
    mockList.mockResolvedValue({results: []});

    await getNotionBlockChildren('block-123');

    expect(mockList).toHaveBeenCalledWith({block_id: 'block-123'});
  });

  it('returns the API response directly', async () => {
    const response = {results: [{id: 'b1', type: 'paragraph'}]};
    mockList.mockResolvedValue(response);

    const result = await getNotionBlockChildren('block-123');

    expect(result).toEqual(response);
  });
});

describe('getNotionBlockChildrenRecursive', () => {
  it('returns flat list of blocks without children', async () => {
    mockList.mockResolvedValue({
      results: [
        {id: 'b1', type: 'paragraph', has_children: false},
        {id: 'b2', type: 'heading_1', has_children: false},
      ],
    });

    const result = await getNotionBlockChildrenRecursive('page-1');

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('b1');
    expect(result[1].id).toBe('b2');
  });

  it('recursively fetches children for blocks with has_children', async () => {
    // First call: top-level blocks
    mockList.mockResolvedValueOnce({
      results: [
        {id: 'parent', type: 'toggle', has_children: true},
      ],
    });
    // Second call: children of 'parent'
    mockList.mockResolvedValueOnce({
      results: [
        {id: 'child', type: 'paragraph', has_children: false},
      ],
    });

    const result = await getNotionBlockChildrenRecursive('page-1');

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('parent');
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children![0].id).toBe('child');
  });

  it('handles deeply nested blocks', async () => {
    // Level 0
    mockList.mockResolvedValueOnce({
      results: [{id: 'l0', type: 'toggle', has_children: true}],
    });
    // Level 1
    mockList.mockResolvedValueOnce({
      results: [{id: 'l1', type: 'toggle', has_children: true}],
    });
    // Level 2
    mockList.mockResolvedValueOnce({
      results: [{id: 'l2', type: 'paragraph', has_children: false}],
    });

    const result = await getNotionBlockChildrenRecursive('page-1');

    expect(result[0].children![0].children![0].id).toBe('l2');
  });

  it('returns empty array for page with no blocks', async () => {
    mockList.mockResolvedValue({results: []});

    const result = await getNotionBlockChildrenRecursive('empty-page');

    expect(result).toEqual([]);
  });
});
