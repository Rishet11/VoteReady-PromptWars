import { sanitizeInput, isValidPinCode } from '@/lib/sanitize';
import { describe, it, expect } from 'vitest';

describe('sanitizeInput', () => {
  it('removes HTML tags', () => {
    expect(sanitizeInput('<script>alert("xss")</script>hello')).toBe('alertxsshello');
  });

  it('removes special characters except alphanumeric, space, dash, and underscore', () => {
    expect(sanitizeInput('hello!@#$%^&*()_+ world-123')).toBe('hello_ world-123');
  });

  it('handles empty input', () => {
    expect(sanitizeInput('')).toBe('');
    expect(sanitizeInput(null as unknown as string)).toBe('');
  });
});

describe('isValidPinCode', () => {
  it('returns true for exactly 6 digits', () => {
    expect(isValidPinCode('110001')).toBe(true);
    expect(isValidPinCode('400001')).toBe(true);
  });

  it('returns false for less than 6 digits', () => {
    expect(isValidPinCode('11000')).toBe(false);
  });

  it('returns false for more than 6 digits', () => {
    expect(isValidPinCode('1100012')).toBe(false);
  });

  it('returns false for non-numeric characters', () => {
    expect(isValidPinCode('11000A')).toBe(false);
    expect(isValidPinCode('110-001')).toBe(false);
  });
});
