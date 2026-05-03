import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isRateLimited, clearRateLimitMapForTests } from '@/lib/rateLimit';
import { GUIDANCE_RATE_LIMIT_REQUESTS, GUIDANCE_RATE_LIMIT_WINDOW_MS } from '@/lib/constants/rateLimit';

describe('isRateLimited', () => {
  beforeEach(() => {
    clearRateLimitMapForTests();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests up to the limit', () => {
    const ip = '127.0.0.1';
    
    // Make (limit - 1) requests, they should all be allowed
    for (let i = 0; i < GUIDANCE_RATE_LIMIT_REQUESTS - 1; i++) {
      expect(isRateLimited(ip)).toBe(false);
    }
    
    // The nth request (the limit) should be allowed
    expect(isRateLimited(ip)).toBe(false);
  });

  it('blocks the request that exceeds the limit', () => {
    const ip = '127.0.0.2';
    
    for (let i = 0; i < GUIDANCE_RATE_LIMIT_REQUESTS; i++) {
      isRateLimited(ip);
    }
    
    // The (limit + 1) request should be blocked
    expect(isRateLimited(ip)).toBe(true);
  });

  it('allows requests again after the window resets', () => {
    const ip = '127.0.0.3';
    
    // Exhaust the limit
    for (let i = 0; i < GUIDANCE_RATE_LIMIT_REQUESTS; i++) {
      isRateLimited(ip);
    }
    expect(isRateLimited(ip)).toBe(true);
    
    // Advance time past the window
    vi.advanceTimersByTime(GUIDANCE_RATE_LIMIT_WINDOW_MS + 10);
    
    // Should be allowed again
    expect(isRateLimited(ip)).toBe(false);
  });
});
