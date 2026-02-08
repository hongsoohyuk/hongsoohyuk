import {queryKeyFactory} from '../api/queryKeyFactory';

describe('queryKeyFactory', () => {
  describe('post', () => {
    it('returns key array with post id', () => {
      expect(queryKeyFactory.post('abc')).toEqual(['instagram', 'post', 'abc']);
    });

    it('returns different keys for different ids', () => {
      expect(queryKeyFactory.post('1')).not.toEqual(queryKeyFactory.post('2'));
    });
  });

  describe('infiniteListMedia', () => {
    it('returns stable key array', () => {
      expect(queryKeyFactory.infiniteListMedia()).toEqual(['instagram', 'infinite-list-media']);
    });

    it('returns same reference structure each call', () => {
      const key1 = queryKeyFactory.infiniteListMedia();
      const key2 = queryKeyFactory.infiniteListMedia();
      expect(key1).toEqual(key2);
    });
  });

  describe('profile', () => {
    it('returns stable key array', () => {
      expect(queryKeyFactory.profile()).toEqual(['instagram', 'profile']);
    });
  });
});
