import {
  GUIDANCE_RATE_LIMIT_REQUESTS,
  GUIDANCE_RATE_LIMIT_WINDOW_MS,
  GUIDANCE_RATE_LIMIT_MAX_ENTRIES,
} from '@/lib/constants/rateLimit';

export interface RateLimitEntry {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitEntry>();

function cleanupRateLimitMap(now: number) {
  if (rateLimitMap.size < GUIDANCE_RATE_LIMIT_MAX_ENTRIES) return;
  
  for (const [key, val] of rateLimitMap.entries()) {
    if (now > val.resetAt) rateLimitMap.delete(key);
  }
  
  if (rateLimitMap.size >= GUIDANCE_RATE_LIMIT_MAX_ENTRIES) {
    rateLimitMap.clear();
  }
}

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    cleanupRateLimitMap(now);
    rateLimitMap.set(ip, { count: 1, resetAt: now + GUIDANCE_RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > GUIDANCE_RATE_LIMIT_REQUESTS;
}

export function clearRateLimitMapForTests() {
  rateLimitMap.clear();
}
