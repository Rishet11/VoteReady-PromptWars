/**
 * Rate limiting constants for public API routes.
 * These protect Gemini API quota from abuse on unauthenticated endpoints.
 * @module constants/rateLimit
 */

/** Maximum requests per IP per rate-limit window on the guidance endpoint. */
export const GUIDANCE_RATE_LIMIT_REQUESTS = 10;

/** Rate-limit window duration in milliseconds (1 minute). */
export const GUIDANCE_RATE_LIMIT_WINDOW_MS = 60_000;

/**
 * Maximum number of unique IPs tracked in the in-memory rate-limit map.
 * Prevents unbounded memory growth on Cloud Run instances.
 */
export const GUIDANCE_RATE_LIMIT_MAX_ENTRIES = 1_000;
