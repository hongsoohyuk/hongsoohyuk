import {schema} from '../types/validation';

describe('guestbook form schema', () => {
  describe('author_name', () => {
    it('accepts valid name', () => {
      const result = schema.safeParse({author_name: 'John', message: 'Hello', emotions: []});
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const result = schema.safeParse({author_name: '', message: 'Hello', emotions: []});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('author_name');
      }
    });

    it('rejects whitespace-only name (trim then min check)', () => {
      const result = schema.safeParse({author_name: '   ', message: 'Hello', emotions: []});
      expect(result.success).toBe(false);
    });

    it('rejects name longer than 12 characters', () => {
      const result = schema.safeParse({author_name: 'A'.repeat(13), message: 'Hello', emotions: []});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Common.validation.maxLength');
      }
    });

    it('accepts name with exactly 12 characters', () => {
      const result = schema.safeParse({author_name: 'A'.repeat(12), message: 'Hello', emotions: []});
      expect(result.success).toBe(true);
    });

    it('trims whitespace before validation', () => {
      const result = schema.safeParse({author_name: '  John  ', message: 'Hello', emotions: []});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.author_name).toBe('John');
      }
    });
  });

  describe('message', () => {
    it('accepts valid message', () => {
      const result = schema.safeParse({author_name: 'John', message: 'Hello!', emotions: []});
      expect(result.success).toBe(true);
    });

    it('rejects empty message', () => {
      const result = schema.safeParse({author_name: 'John', message: '', emotions: []});
      expect(result.success).toBe(false);
    });

    it('rejects message longer than 40 characters', () => {
      const result = schema.safeParse({author_name: 'John', message: 'A'.repeat(41), emotions: []});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Common.validation.maxLength');
      }
    });

    it('accepts message with exactly 40 characters', () => {
      const result = schema.safeParse({author_name: 'John', message: 'A'.repeat(40), emotions: []});
      expect(result.success).toBe(true);
    });
  });

  describe('emotions', () => {
    it('defaults to empty array when not provided', () => {
      const result = schema.safeParse({author_name: 'John', message: 'Hello'});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.emotions).toEqual([]);
      }
    });

    it('accepts up to 2 emotions', () => {
      const result = schema.safeParse({author_name: 'John', message: 'Hello', emotions: ['LIKE', 'FUN']});
      expect(result.success).toBe(true);
    });

    it('rejects more than 2 emotions', () => {
      const result = schema.safeParse({
        author_name: 'John',
        message: 'Hello',
        emotions: ['LIKE', 'FUN', 'NICE'],
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Guestbook.formSection.validation.emotionLimit');
      }
    });
  });

  describe('full form', () => {
    it('validates a complete valid form', () => {
      const result = schema.safeParse({
        author_name: 'Alice',
        message: 'Great portfolio!',
        emotions: ['LIKE'],
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          author_name: 'Alice',
          message: 'Great portfolio!',
          emotions: ['LIKE'],
        });
      }
    });

    it('collects multiple validation errors', () => {
      const result = schema.safeParse({author_name: '', message: '', emotions: ['a', 'b', 'c']});
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
      }
    });
  });
});
