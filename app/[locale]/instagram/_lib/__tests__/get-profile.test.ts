jest.mock('../local', () => ({
  readInstagramStaticJson: jest.fn(),
}));

import {getInstagramProfile} from '../get-profile';
import {readInstagramStaticJson} from '../local';

const mockReadJson = readInstagramStaticJson as jest.Mock;

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
