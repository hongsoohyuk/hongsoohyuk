jest.mock('../api/local', () => ({
  readInstagramStaticJson: jest.fn(),
}));

import {getInstagramPostList, getInstagramOriginPostList} from '../api/list-post';
import {readInstagramStaticJson} from '../api/local';

const mockReadJson = readInstagramStaticJson as jest.Mock;
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getInstagramPostList', () => {
  it('reads from static JSON file', async () => {
    const mockData = {data: [{id: '1', media_type: 'IMAGE'}]};
    mockReadJson.mockResolvedValue(mockData);

    const result = await getInstagramPostList();

    expect(mockReadJson).toHaveBeenCalledWith('feed.json');
    expect(result).toEqual(mockData);
  });

  it('throws when static file is missing', async () => {
    mockReadJson.mockRejectedValue(new Error('File not found'));

    await expect(getInstagramPostList()).rejects.toThrow('File not found');
  });
});

describe('getInstagramOriginPostList', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      INSTAGRAM_ACCESS_TOKEN: 'test-token',
      INSTAGRAM_GRAPH_URL: 'https://graph.instagram.com',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('throws when no access token', async () => {
    delete process.env.INSTAGRAM_ACCESS_TOKEN;

    await expect(getInstagramOriginPostList()).rejects.toThrow('No access token');
  });

  it('fetches from Instagram API with correct params', async () => {
    const mockData = {data: [{id: '1'}]};
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    const result = await getInstagramOriginPostList();

    expect(result).toEqual(mockData);
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('https://graph.instagram.com/me/media');
    expect(calledUrl).toContain('access_token=test-token');
    expect(calledUrl).toContain('limit=120');
  });

  it('throws on non-OK response', async () => {
    mockFetch.mockResolvedValue({ok: false, status: 401});

    await expect(getInstagramOriginPostList()).rejects.toThrow('Failed to fetch Instagram posts');
  });
});
