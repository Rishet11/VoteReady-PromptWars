/**
 * In-Memory Guidance Cache
 * Caches Gemini-generated guidance responses to avoid redundant API calls
 * within the same server instance. TTL-based expiry with automatic cleanup.
 * @module guidanceCache
 */

import type { GuidanceResponse } from './guidanceTypes';

const guidanceCache = new Map<string, { response: GuidanceResponse; expiry: number }>();

/**
 * Retrieves cached guidance for a given cache key.
 * Returns null if the entry is missing or expired.
 */

export function getCachedGuidance(cacheKey: string) {
  const cached = guidanceCache.get(cacheKey);

  if (!cached || cached.expiry <= Date.now()) {
    guidanceCache.delete(cacheKey);
    return null;
  }

  return cached.response;
}

/**
 * Stores a guidance response in the in-memory cache with TTL.
 * @param cacheKey - The composite key (stateCode:language).
 * @param response - The guidance response to cache.
 * @param ttlMs - Time-to-live in milliseconds.
 */
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

/** Clears all cached guidance entries. Used only in test suites. */
export function clearGuidanceCacheForTests() {
  guidanceCache.clear();
}
