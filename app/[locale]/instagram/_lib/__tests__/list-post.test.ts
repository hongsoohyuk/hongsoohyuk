jest.mock('../local', () => ({
  readInstagramStaticJson: jest.fn(),
}));

import {getInstagramPostList} from '../list-post';
import {readInstagramStaticJson} from '../local';

const mockReadJson = readInstagramStaticJson as jest.Mock;

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
