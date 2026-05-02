import type { GuidanceResponse } from './guidanceTypes';

const guidanceCache = new Map<string, { response: GuidanceResponse; expiry: number }>();

export function getCachedGuidance(cacheKey: string) {
  const cached = guidanceCache.get(cacheKey);

  if (!cached || cached.expiry <= Date.now()) {
    guidanceCache.delete(cacheKey);
    return null;
  }

  return cached.response;
}

export function setCachedGuidance(
  cacheKey: string,
  response: GuidanceResponse,
  ttlMs: number
) {
  guidanceCache.set(cacheKey, {
    response,
    expiry: Date.now() + ttlMs,
  });
}

export function clearGuidanceCacheForTests() {
  guidanceCache.clear();
}
