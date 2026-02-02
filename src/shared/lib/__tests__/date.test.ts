import { formatDate, formatDateTime, truncateText, isValidEmail } from '../date/utils';

describe('date/utils', () => {
  describe('formatDate', () => {
    it('Date 객체를 한국어 날짜 형식으로 변환한다', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toContain('2024');
      expect(result).toContain('1');
      expect(result).toContain('15');
    });

    it('문자열 날짜를 한국어 날짜 형식으로 변환한다', () => {
      const result = formatDate('2024-12-25');
      expect(result).toContain('2024');
      expect(result).toContain('12');
      expect(result).toContain('25');
    });
  });

  describe('formatDateTime', () => {
    it('Date 객체를 한국어 날짜 및 시간 형식으로 변환한다', () => {
      const date = new Date('2024-01-15T14:30:00');
      const result = formatDateTime(date);
      expect(result).toContain('2024');
      expect(result).toContain('1');
      expect(result).toContain('15');
    });

    it('문자열 날짜를 한국어 날짜 및 시간 형식으로 변환한다', () => {
      const result = formatDateTime('2024-12-25T09:00:00');
      expect(result).toContain('2024');
      expect(result).toContain('12');
      expect(result).toContain('25');
    });
  });

  describe('truncateText', () => {
    it('최대 길이보다 짧은 텍스트는 그대로 반환한다', () => {
      expect(truncateText('짧은 텍스트', 20)).toBe('짧은 텍스트');
    });

    it('최대 길이보다 긴 텍스트는 잘라내고 ...을 붙인다', () => {
      expect(truncateText('이것은 매우 긴 텍스트입니다', 10)).toBe('이것은 매우 긴 텍...');
    });

    it('최대 길이와 같은 텍스트는 그대로 반환한다', () => {
      expect(truncateText('12345', 5)).toBe('12345');
    });

    it('빈 문자열은 그대로 반환한다', () => {
      expect(truncateText('', 10)).toBe('');
    });
  });

  describe('isValidEmail', () => {
    it('유효한 이메일은 true를 반환한다', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.kr')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('유효하지 않은 이메일은 false를 반환한다', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('spaces in@email.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });
});
