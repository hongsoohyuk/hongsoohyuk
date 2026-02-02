import { parsePositiveInt } from '../number';

describe('number utils', () => {
  describe('parsePositiveInt', () => {
    it('유효한 양수 문자열을 숫자로 변환한다', () => {
      expect(parsePositiveInt('42')).toBe(42);
      expect(parsePositiveInt('1')).toBe(1);
      expect(parsePositiveInt('1000')).toBe(1000);
    });

    it('문자열 배열의 첫 번째 값을 파싱한다', () => {
      expect(parsePositiveInt(['10', '20'])).toBe(10);
      expect(parsePositiveInt(['5'])).toBe(5);
    });

    it('null 또는 undefined는 null을 반환한다', () => {
      expect(parsePositiveInt(null)).toBeNull();
      expect(parsePositiveInt(undefined)).toBeNull();
    });

    it('빈 문자열은 null을 반환한다', () => {
      expect(parsePositiveInt('')).toBeNull();
    });

    it('0은 null을 반환한다 (양수만 허용)', () => {
      expect(parsePositiveInt('0')).toBeNull();
    });

    it('음수는 null을 반환한다', () => {
      expect(parsePositiveInt('-5')).toBeNull();
      expect(parsePositiveInt('-100')).toBeNull();
    });

    it('유효하지 않은 숫자 문자열은 null을 반환한다', () => {
      expect(parsePositiveInt('abc')).toBeNull();
      expect(parsePositiveInt('12.5')).toBe(12); // parseInt는 정수 부분만 파싱
      expect(parsePositiveInt('NaN')).toBeNull();
    });

    it('빈 배열은 null을 반환한다', () => {
      expect(parsePositiveInt([])).toBeNull();
    });
  });
});
