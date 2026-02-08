jest.mock('node:fs/promises', () => ({
  readFile: jest.fn(),
}));

import {readInstagramStaticJson} from '../api/local';
import {readFile} from 'node:fs/promises';

const mockReadFile = readFile as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('readInstagramStaticJson', () => {
  it('reads and parses JSON file', async () => {
    const data = {data: [{id: '1'}]};
    mockReadFile.mockResolvedValue(JSON.stringify(data));

    const result = await readInstagramStaticJson('feed.json');

    expect(result).toEqual(data);
    expect(mockReadFile).toHaveBeenCalledWith(
      expect.stringContaining('instagram/feed.json'),
      'utf8',
    );
  });

  it('throws descriptive error when file is missing', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT: no such file'));

    await expect(readInstagramStaticJson('missing.json')).rejects.toThrow(
      /Missing Instagram static data/,
    );
  });

  it('throws descriptive error for invalid JSON', async () => {
    mockReadFile.mockResolvedValue('not json');

    await expect(readInstagramStaticJson('bad.json')).rejects.toThrow();
  });
});
