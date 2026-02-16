jest.mock('@/lib/api/notion', () => ({
  notion: {
    dataSources: {
      query: jest.fn(),
    },
  },
}));

import {getBlogList} from '../api/get-blog-list';
import {notion} from '@/lib/api/notion';

const mockQuery = notion.dataSources.query as jest.Mock;

function makePage(id: string, title: string, categories: string[] = [], lastEdited = '2024-01-01T00:00:00Z') {
  return {
    id,
    last_edited_time: lastEdited,
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

describe('getBlogList', () => {
  it('returns items from Notion query', async () => {
    mockQuery.mockResolvedValue({
      results: [makePage('page-1', 'First Post', ['Frontend'])],
    });

    const result = await getBlogList();

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('First Post');
    expect(result.items[0].slug).toBe('page1');
    expect(result.items[0].categories).toEqual(['Frontend']);
  });

  it('returns empty items when no results', async () => {
    mockQuery.mockResolvedValue({results: []});

    const result = await getBlogList();

    expect(result.items).toEqual([]);
  });

  it('passes search query filter', async () => {
    mockQuery.mockResolvedValue({results: []});

    await getBlogList({q: 'react'});

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: {property: 'Doc name', title: {contains: 'react'}},
      }),
    );
  });

  it('passes category filter', async () => {
    mockQuery.mockResolvedValue({results: []});

    await getBlogList({category: 'Frontend'});

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: {property: 'Category', multi_select: {contains: 'Frontend'}},
      }),
    );
  });

  it('combines search and category with and filter', async () => {
    mockQuery.mockResolvedValue({results: []});

    await getBlogList({q: 'react', category: 'Frontend'});

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        filter: {
          and: [
            {property: 'Doc name', title: {contains: 'react'}},
            {property: 'Category', multi_select: {contains: 'Frontend'}},
          ],
        },
      }),
    );
  });

  it('does not pass filter when no params', async () => {
    mockQuery.mockResolvedValue({results: []});

    await getBlogList();

    expect(mockQuery).toHaveBeenCalledWith(
      expect.objectContaining({filter: undefined}),
    );
  });

  it('returns Untitled when page has no title property', async () => {
    mockQuery.mockResolvedValue({
      results: [
        {
          id: 'no-title',
          last_edited_time: '2024-01-01T00:00:00Z',
          properties: {
            Other: {type: 'rich_text', rich_text: []},
          },
        },
      ],
    });

    const result = await getBlogList();

    expect(result.items[0].title).toBe('Untitled');
  });

  it('returns empty categories when Category property is missing', async () => {
    mockQuery.mockResolvedValue({
      results: [
        {
          id: 'no-cat',
          last_edited_time: '2024-01-01T00:00:00Z',
          properties: {
            'Doc name': {type: 'title', title: [{plain_text: 'No Cat Post'}]},
          },
        },
      ],
    });

    const result = await getBlogList();

    expect(result.items[0].categories).toEqual([]);
  });

});
