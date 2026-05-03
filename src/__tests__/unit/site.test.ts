import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getSiteUrl, DEFAULT_SITE_URL } from '@/lib/site';

describe('site configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns DEFAULT_SITE_URL if env var is missing', () => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    expect(getSiteUrl()).toBe(DEFAULT_SITE_URL);
  });

  it('returns NEXT_PUBLIC_SITE_URL and removes trailing slash', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom.com/';
    expect(getSiteUrl()).toBe('https://custom.com');
  });

  it('returns NEXT_PUBLIC_SITE_URL without modifying if no trailing slash', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://custom.com';
    expect(getSiteUrl()).toBe('https://custom.com');
  });
});
