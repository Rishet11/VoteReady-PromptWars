import { describe, it, expect } from 'vitest';
import { ok, err } from '@/lib/result';

describe('result utility', () => {
  it('creates an ok result', () => {
    const result = ok('test');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('test');
    }
  });

  it('creates an err result with default error', () => {
    const result = err('failure');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe('failure');
      expect(result.error).toBeInstanceOf(Error);
    }
  });

  it('creates an err result with custom error', () => {
    const customError = { code: 500 };
    const result = err('failure', customError);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe(customError);
    }
  });
});
