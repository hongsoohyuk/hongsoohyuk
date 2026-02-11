import {parsePositiveInt} from '../number';

describe('parsePositiveInt', () => {
  it('parses a positive integer string', () => {
    expect(parsePositiveInt('5')).toBe(5);
  });

  it('parses a large positive integer string', () => {
    expect(parsePositiveInt('100')).toBe(100);
  });

  it('returns null for "0"', () => {
    expect(parsePositiveInt('0')).toBeNull();
  });

  it('returns null for negative number string', () => {
    expect(parsePositiveInt('-1')).toBeNull();
  });

  it('returns null for non-numeric string', () => {
    expect(parsePositiveInt('abc')).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(parsePositiveInt(undefined)).toBeNull();
  });

  it('returns null for null', () => {
    expect(parsePositiveInt(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parsePositiveInt('')).toBeNull();
  });

  it('uses first element when given an array', () => {
    expect(parsePositiveInt(['3', '7'])).toBe(3);
  });

  it('returns null for array with non-numeric first element', () => {
    expect(parsePositiveInt(['abc', '7'])).toBeNull();
  });

  it('parses string with trailing non-numeric characters', () => {
    expect(parsePositiveInt('42abc')).toBe(42);
  });

  it('returns null for float string (parseInt behavior)', () => {
    // parseInt('3.7') returns 3, which is positive
    expect(parsePositiveInt('3.7')).toBe(3);
  });
});
