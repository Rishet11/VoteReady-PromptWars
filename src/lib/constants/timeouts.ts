/**
 * Timeout constants used across the lib and API layers.
 * @module constants/timeouts
 */

/** Maximum time (ms) to wait for a Gemini AI API call before aborting. */
export const GEMINI_TIMEOUT_MS = 5000;

/** Maximum time (ms) to wait for a Google Cloud Translation API call. */
export const TRANSLATION_TIMEOUT_MS = 3000;

/**
 * Maximum time (ms) to wait for a single Firestore cache operation.
 * Re-exported from constants/cache for convenience — both paths are valid.
 */
export { FIRESTORE_CACHE_TIMEOUT_MS } from './cache';
