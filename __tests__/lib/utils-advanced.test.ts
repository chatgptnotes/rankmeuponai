import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, truncate, slugify } from '@/lib/utils';

describe('Date formatting utilities', () => {
  describe('formatDate', () => {
    it('should format Date object correctly', () => {
      const date = new Date('2025-11-14');
      const result = formatDate(date);
      expect(result).toMatch(/November 14, 2025/);
    });

    it('should format date string correctly', () => {
      const result = formatDate('2025-11-14');
      expect(result).toMatch(/November 14, 2025/);
    });
  });

  describe('formatDateTime', () => {
    it('should format Date object with time', () => {
      const date = new Date('2025-11-14T15:30:00');
      const result = formatDateTime(date);
      expect(result).toContain('November 14, 2025');
      expect(result).toMatch(/\d{1,2}:\d{2}/); // Contains time
    });

    it('should format date string with time', () => {
      const result = formatDateTime('2025-11-14T10:00:00');
      expect(result).toContain('November 14, 2025');
    });
  });
});

describe('String utilities', () => {
  describe('truncate', () => {
    it('should truncate long strings', () => {
      const result = truncate('This is a very long string', 10);
      expect(result).toBe('This is a ...');
    });

    it('should not truncate short strings', () => {
      const result = truncate('Short', 10);
      expect(result).toBe('Short');
    });

    it('should handle exact length', () => {
      const result = truncate('Exact text', 10);
      expect(result).toBe('Exact text');
    });

    it('should handle empty strings', () => {
      const result = truncate('', 10);
      expect(result).toBe('');
    });
  });

  describe('slugify', () => {
    it('should convert spaces to hyphens', () => {
      const result = slugify('Hello World');
      expect(result).toBe('hello-world');
    });

    it('should remove special characters', () => {
      const result = slugify('Hello! World@123');
      expect(result).toBe('hello-world123');
    });

    it('should convert to lowercase', () => {
      const result = slugify('HELLO WORLD');
      expect(result).toBe('hello-world');
    });

    it('should handle multiple spaces and hyphens', () => {
      const result = slugify('Hello   ---   World');
      expect(result).toBe('hello-world');
    });

    it('should remove leading and trailing hyphens', () => {
      const result = slugify('---hello-world---');
      expect(result).toBe('hello-world');
    });

    it('should handle underscores', () => {
      const result = slugify('hello_world_test');
      expect(result).toBe('hello-world-test');
    });

    it('should handle empty strings', () => {
      const result = slugify('');
      expect(result).toBe('');
    });
  });
});
