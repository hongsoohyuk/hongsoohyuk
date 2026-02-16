jest.mock('@/lib/api/notion', () => ({
  notion: {
    dataSources: {
      query: jest.fn(),
    },
  },
}));

import {getProjectList} from '../api/pages/get-project-list';
import {notion} from '@/lib/api/notion';

const mockQuery = notion.dataSources.query as jest.Mock;

function makePage(id: string, title: string, description = '', createdTime = '2024-01-01T00:00:00Z') {
  return {
    id,
    created_time: createdTime,
    last_edited_time: createdTime,
    properties: {
      Title: {
        type: 'title',
        title: [{plain_text: title}],
      },
      Description: {
        type: 'rich_text',
        rich_text: description ? [{plain_text: description}] : [],
      },
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getProjectList', () => {
  it('returns items from Notion query', async () => {
    mockQuery.mockResolvedValue({
      results: [makePage('page-1', 'Project 1', 'Description 1')],
    });

    const result = await getProjectList();

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Project 1');
    expect(result.items[0].description).toBe('Description 1');
    expect(result.items[0].slug).toBe('page1');
  });

  it('returns empty items when no results', async () => {
    mockQuery.mockResolvedValue({results: []});

    const result = await getProjectList();

    expect(result.items).toEqual([]);
  });

  it('generates correct slugs (removes hyphens)', async () => {
    mockQuery.mockResolvedValue({
      results: [makePage('123e4567-e89b-12d3-a456-426614174000', 'Test')],
    });

    const result = await getProjectList();

    expect(result.items[0].slug).toBe('123e4567e89b12d3a456426614174000');
  });

  it('returns Untitled when page has no title property', async () => {
    mockQuery.mockResolvedValue({
      results: [
        {
          id: 'no-title',
          created_time: '2024-01-01T00:00:00Z',
          properties: {
            Other: {type: 'rich_text', rich_text: []},
          },
        },
      ],
    });

    const result = await getProjectList();

    expect(result.items[0].title).toBe('Untitled');
  });

  it('returns empty description when Description property is missing', async () => {
    mockQuery.mockResolvedValue({
      results: [
        {
          id: 'no-desc',
          created_time: '2024-01-01T00:00:00Z',
          properties: {
            Title: {type: 'title', title: [{plain_text: 'No Desc'}]},
          },
        },
      ],
    });

    const result = await getProjectList();

    expect(result.items[0].description).toBe('');
  });

});
