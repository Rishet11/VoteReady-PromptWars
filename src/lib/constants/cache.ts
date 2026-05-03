/**
 * Cache-related named constants.
 * Centralises every magic literal used in firestoreCache.ts and related modules.
 * @module constants/cache
 */

/** Firestore collection name for the PIN lookup cache. */
export const PIN_CACHE_COLLECTION = 'pinLookupCache';

/**
 * Time-to-live for a cached PIN lookup entry (24 hours in milliseconds).
 * Re-exported here for backward compatibility — firestoreCache.ts continues
 * to export it under the same name.
 */
export const PIN_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Maximum time (ms) to wait for a single Firestore cache read or write. */
export const FIRESTORE_CACHE_TIMEOUT_MS = 800;
