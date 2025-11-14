import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-blue-500');
  });

  it('should handle conditional classes', () => {
    const result = cn('base-class', false && 'hidden', 'visible');
    expect(result).toContain('base-class');
    expect(result).toContain('visible');
    expect(result).not.toContain('hidden');
  });

  it('should override conflicting Tailwind classes', () => {
    const result = cn('text-sm', 'text-lg');
    // tailwind-merge should keep only text-lg
    expect(result).toBe('text-lg');
  });

  it('should handle empty inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle undefined and null values', () => {
    const result = cn('valid-class', undefined, null, 'another-class');
    expect(result).toContain('valid-class');
    expect(result).toContain('another-class');
  });
});
