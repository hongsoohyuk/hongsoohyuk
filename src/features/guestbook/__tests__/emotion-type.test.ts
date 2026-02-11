import {normalizeGuestbookEmotions} from '../emotion/type';

describe('normalizeGuestbookEmotions', () => {
  it('normalizes valid emotion codes', () => {
    expect(normalizeGuestbookEmotions(['LIKE', 'FUN'])).toEqual(['LIKE', 'FUN']);
  });

  it('converts lowercase to uppercase', () => {
    expect(normalizeGuestbookEmotions(['like', 'fun'])).toEqual(['LIKE', 'FUN']);
  });

  it('filters out invalid emotion codes', () => {
    expect(normalizeGuestbookEmotions(['LIKE', 'INVALID', 'FUN'])).toEqual(['LIKE', 'FUN']);
  });

  it('removes duplicates', () => {
    expect(normalizeGuestbookEmotions(['LIKE', 'LIKE', 'FUN'])).toEqual(['LIKE', 'FUN']);
  });

  it('respects default limit of 2', () => {
    expect(normalizeGuestbookEmotions(['LIKE', 'FUN', 'NICE'])).toEqual(['LIKE', 'FUN']);
  });

  it('respects custom limit', () => {
    expect(normalizeGuestbookEmotions(['LIKE', 'FUN', 'NICE'], 3)).toEqual(['LIKE', 'FUN', 'NICE']);
  });

  it('returns empty array for empty input', () => {
    expect(normalizeGuestbookEmotions([])).toEqual([]);
  });

  it('handles non-string values by converting them', () => {
    expect(normalizeGuestbookEmotions([123, null, 'LIKE'])).toEqual(['LIKE']);
  });

  it('handles mixed case', () => {
    expect(normalizeGuestbookEmotions(['Like', 'fUn'])).toEqual(['LIKE', 'FUN']);
  });
});
