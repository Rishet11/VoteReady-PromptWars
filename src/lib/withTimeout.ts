/**
 * @module withTimeout
 * Provides a utility to race any promise against a configurable deadline.
 * Used throughout the app to enforce SLAs on external API calls.
 */

/**
 * Wraps a promise with a deadline. Rejects with an Error if the promise
 * does not settle within the specified duration.
 *
 * @param promise - The async operation to constrain
 * @param ms - Maximum allowed duration in milliseconds
 * @param label - Human-readable name for the operation; appears in the
 *                rejection message for easier debugging
 * @returns A promise that resolves with the original value, or rejects
 *          after `ms` milliseconds with a descriptive timeout error
 * @example
 *   const result = await withTimeout(fetchTranslation(text), TRANSLATE_TIMEOUT_MS, 'Translation');
 */
export function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label = 'Operation'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`${label} timed out after ${ms}ms`)),
        ms
      )
    ),
  ]);
}
