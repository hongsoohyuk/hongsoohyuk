import {toggleEmotion, isValidEmotionSet, MAX_EMOTIONS} from '../emotion/validation';
import type {EmotionCode} from '../emotion/type';

describe('toggleEmotion', () => {
  it('adds an emotion to empty array', () => {
    expect(toggleEmotion([], 'LIKE')).toEqual(['LIKE']);
  });

  it('adds a second emotion', () => {
    expect(toggleEmotion(['LIKE'], 'FUN')).toEqual(['LIKE', 'FUN']);
  });

  it('removes an emotion that already exists', () => {
    expect(toggleEmotion(['LIKE', 'FUN'], 'LIKE')).toEqual(['FUN']);
  });

  it('does not add beyond MAX_EMOTIONS', () => {
    const current: EmotionCode[] = ['LIKE', 'FUN'];
    expect(toggleEmotion(current, 'NICE')).toEqual(['LIKE', 'FUN']);
  });

  it('can remove and re-add at max capacity', () => {
    const step1 = toggleEmotion(['LIKE', 'FUN'], 'LIKE'); // ['FUN']
    const step2 = toggleEmotion(step1, 'NICE'); // ['FUN', 'NICE']
    expect(step2).toEqual(['FUN', 'NICE']);
  });

  it('toggles off the only selected emotion', () => {
    expect(toggleEmotion(['HELLO'], 'HELLO')).toEqual([]);
  });
});

describe('isValidEmotionSet', () => {
  it('returns true for empty set', () => {
    expect(isValidEmotionSet([])).toBe(true);
  });

  it('returns true for single emotion', () => {
    expect(isValidEmotionSet(['LIKE'])).toBe(true);
  });

  it('returns true for two unique emotions', () => {
    expect(isValidEmotionSet(['LIKE', 'FUN'])).toBe(true);
  });

  it('returns false for more than MAX_EMOTIONS', () => {
    expect(isValidEmotionSet(['LIKE', 'FUN', 'NICE'])).toBe(false);
  });

  it('returns false for duplicate emotions', () => {
    expect(isValidEmotionSet(['LIKE', 'LIKE'])).toBe(false);
  });
});

describe('MAX_EMOTIONS', () => {
  it('is 2', () => {
    expect(MAX_EMOTIONS).toBe(2);
  });
});
