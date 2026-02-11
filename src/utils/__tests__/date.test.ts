import {formatDate, formatDateTime, truncateText, isValidEmail} from '../date';

describe('formatDate', () => {
  it('formats a Date object in Korean locale', () => {
    const result = formatDate(new Date('2024-03-15T00:00:00Z'));
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/3/);
    expect(result).toMatch(/15/);
  });

  it('formats a date string', () => {
    const result = formatDate('2024-01-01T00:00:00Z');
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/1/);
  });
});

describe('formatDateTime', () => {
  it('formats a Date object with time', () => {
    const result = formatDateTime(new Date('2024-06-15T14:30:00Z'));
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/6/);
    expect(result).toMatch(/15/);
  });

  it('formats a date string with time', () => {
    const result = formatDateTime('2024-12-25T10:00:00Z');
    expect(result).toMatch(/2024/);
    expect(result).toMatch(/12/);
    expect(result).toMatch(/25/);
  });
});

describe('truncateText', () => {
  it('returns text unchanged if within maxLength', () => {
    expect(truncateText('hello', 10)).toBe('hello');
  });

  it('returns text unchanged if exactly maxLength', () => {
    expect(truncateText('hello', 5)).toBe('hello');
  });

  it('truncates and adds ellipsis when text exceeds maxLength', () => {
    expect(truncateText('hello world', 5)).toBe('hello\u2026');
  });

  it('handles empty string', () => {
    expect(truncateText('', 5)).toBe('');
  });

  it('handles maxLength of 0', () => {
    expect(truncateText('hello', 0)).toBe('\u2026');
  });
});

describe('isValidEmail', () => {
  it('returns true for valid email', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('returns true for email with subdomain', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true);
  });

  it('returns true for email with dots in local part', () => {
    expect(isValidEmail('first.last@example.com')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('returns false for string without @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('returns false for string with spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false);
  });

  it('returns false for string without domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('returns false for string without local part', () => {
    expect(isValidEmail('@example.com')).toBe(false);
  });
});
