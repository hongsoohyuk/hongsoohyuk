import {getProjectList} from '../api/pages/get-project-list';

// Mock the notion client
jest.mock('@/lib/api/notion', () => ({
  notion: {
    blocks: {
      children: {
        list: jest.fn(),
      },
    },
    pages: {
      retrieve: jest.fn(),
    },
  },
}));

import {notion} from '@/lib/api/notion';

const mockNotionList = notion.blocks.children.list as jest.MockedFunction<typeof notion.blocks.children.list>;
const mockNotionPagesRetrieve = notion.pages.retrieve as jest.MockedFunction<typeof notion.pages.retrieve>;

const createMockPageResponse = (id: string) => ({
  id,
  object: 'page',
  created_time: '2024-01-01T00:00:00.000Z',
  last_edited_time: '2024-01-01T00:00:00.000Z',
  cover: null,
  icon: null,
  parent: {type: 'page_id', page_id: 'parent-id'},
  archived: false,
  in_trash: false,
  properties: {},
  url: `https://notion.so/${id}`,
});

describe('getProjectList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock for pages.retrieve - returns page with id from call
    mockNotionPagesRetrieve.mockImplementation(async ({page_id}) =>
      createMockPageResponse(page_id as string) as any
    );
  });

  const createChildPageBlock = (id: string, title: string) => ({
    id,
    type: 'child_page',
    child_page: {title},
    created_time: '2024-01-01T00:00:00.000Z',
    last_edited_time: '2024-01-01T00:00:00.000Z',
    archived: false,
    in_trash: false,
    has_children: false,
    parent: {type: 'page_id', page_id: 'parent-id'},
    object: 'block',
  });

  it('returns paginated project list', async () => {
    mockNotionList.mockResolvedValue({
      results: [
        createChildPageBlock('id-1', 'Project 1'),
        createChildPageBlock('id-2', 'Project 2'),
        createChildPageBlock('id-3', 'Project 3'),
      ],
      has_more: false,
      next_cursor: null,
      type: 'block',
      block: {},
      object: 'list',
    });

    const result = await getProjectList({page: 1, pageSize: 2});

    expect(result.items).toHaveLength(2);
    expect(result.items[0].title).toBe('Project 1');
    expect(result.items[1].title).toBe('Project 2');
    expect(result.pagination.totalItems).toBe(3);
    expect(result.pagination.totalPages).toBe(2);
  });

  it('returns second page correctly', async () => {
    mockNotionList.mockResolvedValue({
      results: [
        createChildPageBlock('id-1', 'Project 1'),
        createChildPageBlock('id-2', 'Project 2'),
        createChildPageBlock('id-3', 'Project 3'),
      ],
      has_more: false,
      next_cursor: null,
      type: 'block',
      block: {},
      object: 'list',
    });

    const result = await getProjectList({page: 2, pageSize: 2});

    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Project 3');
  });

  it('filters out non-child_page blocks', async () => {
    mockNotionList.mockResolvedValue({
      results: [
        createChildPageBlock('id-1', 'Project 1'),
        {
          id: 'paragraph-id',
          type: 'paragraph',
          paragraph: {rich_text: []},
          created_time: '2024-01-01T00:00:00.000Z',
          last_edited_time: '2024-01-01T00:00:00.000Z',
          archived: false,
          in_trash: false,
          has_children: false,
          parent: {type: 'page_id', page_id: 'parent-id'},
          object: 'block',
        },
        createChildPageBlock('id-2', 'Project 2'),
      ],
      has_more: false,
      next_cursor: null,
      type: 'block',
      block: {},
      object: 'list',
    });

    const result = await getProjectList();

    expect(result.items).toHaveLength(2);
    expect(result.pagination.totalItems).toBe(2);
  });

  it('generates correct slugs (removes hyphens)', async () => {
    mockNotionList.mockResolvedValue({
      results: [createChildPageBlock('123e4567-e89b-12d3-a456-426614174000', 'Test')],
      has_more: false,
      next_cursor: null,
      type: 'block',
      block: {},
      object: 'list',
    });

    const result = await getProjectList();

    expect(result.items[0].slug).toBe('123e4567e89b12d3a456426614174000');
  });

  it('uses default pagination values', async () => {
    mockNotionList.mockResolvedValue({
      results: [],
      has_more: false,
      next_cursor: null,
      type: 'block',
      block: {},
      object: 'list',
    });

    const result = await getProjectList();

    expect(result.pagination.page).toBe(1);
    expect(result.pagination.pageSize).toBe(10);
  });

  it('handles empty results', async () => {
    mockNotionList.mockResolvedValue({
      results: [],
      has_more: false,
      next_cursor: null,
      type: 'block',
      block: {},
      object: 'list',
    });

    const result = await getProjectList();

    expect(result.items).toHaveLength(0);
    expect(result.pagination.totalItems).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  it('handles missing title gracefully', async () => {
    mockNotionList.mockResolvedValue({
      results: [
        {
          id: 'id-1',
          type: 'child_page',
          child_page: {},
          created_time: '2024-01-01T00:00:00.000Z',
          last_edited_time: '2024-01-01T00:00:00.000Z',
          archived: false,
          in_trash: false,
          has_children: false,
          parent: {type: 'page_id', page_id: 'parent-id'},
          object: 'block',
        },
      ],
      has_more: false,
      next_cursor: null,
      type: 'block',
      block: {},
      object: 'list',
    });

    const result = await getProjectList();

    expect(result.items[0].title).toBe('Untitled');
  });
});
