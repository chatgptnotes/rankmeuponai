import { describe, it, expect } from 'vitest';
import { incrementVersion } from '@/lib/version/version';

describe('Version utility functions', () => {
  describe('incrementVersion', () => {
    it('should increment minor version from 1.0', () => {
      const result = incrementVersion('1.0');
      expect(result).toBe('1.1');
    });

    it('should increment minor version from 1.5', () => {
      const result = incrementVersion('1.5');
      expect(result).toBe('1.6');
    });

    it('should handle version 2.0', () => {
      const result = incrementVersion('2.0');
      expect(result).toBe('2.1');
    });

    it('should increment minor version from 1.99', () => {
      const result = incrementVersion('1.99');
      expect(result).toBe('1.100');
    });

    it('should handle malformed version strings gracefully', () => {
      const result = incrementVersion('invalid');
      expect(result).toBe('1.1');
    });

    it('should handle empty version string', () => {
      const result = incrementVersion('');
      expect(result).toBe('1.1');
    });
  });
});
