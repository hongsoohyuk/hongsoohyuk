jest.mock('../api/local', () => ({
  readInstagramStaticJson: jest.fn(),
}));

import {getInstagramProfile, getInstagramOriginProfile} from '../api/get-profile';
import {readInstagramStaticJson} from '../api/local';

const mockReadJson = readInstagramStaticJson as jest.Mock;
const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getInstagramProfile', () => {
  it('reads from static JSON file', async () => {
    const mockProfile = {id: '123', username: 'testuser', media_count: 10};
    mockReadJson.mockResolvedValue(mockProfile);

    const result = await getInstagramProfile();

    expect(mockReadJson).toHaveBeenCalledWith('profile.json');
    expect(result).toEqual(mockProfile);
  });
});

describe('getInstagramOriginProfile', () => {
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

    await expect(getInstagramOriginProfile()).rejects.toThrow('No access token');
  });

  it('fetches profile from Instagram API', async () => {
    const mockProfile = {id: '123', username: 'testuser'};
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockProfile),
    });

    const result = await getInstagramOriginProfile();

    expect(result).toEqual(mockProfile);
    const calledUrl = mockFetch.mock.calls[0][0] as string;
    expect(calledUrl).toContain('https://graph.instagram.com/me');
    expect(calledUrl).toContain('access_token=test-token');
    expect(calledUrl).toContain('fields=');
  });

  it('throws on non-OK response', async () => {
    mockFetch.mockResolvedValue({ok: false, status: 500});

    await expect(getInstagramOriginProfile()).rejects.toThrow('Failed to fetch Instagram profile');
  });
});
