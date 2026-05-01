import { calculateDaysRemaining } from '@/lib/utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('calculateDaysRemaining', () => {
  beforeEach(() => {
    // Mock current date to May 1, 2026
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calculates future dates correctly', () => {
    // 2026-05-15 is 14 days after 2026-05-01
    expect(calculateDaysRemaining('2026-05-15')).toBe(14);
  });

  it('returns 0 for the same day', () => {
    expect(calculateDaysRemaining('2026-05-01')).toBe(0);
  });

  it('returns negative number for past dates', () => {
    // 2026-04-20 is 11 days before 2026-05-01
    expect(calculateDaysRemaining('2026-04-20')).toBe(-11);
  });
});
