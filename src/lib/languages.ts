/**
 * Supported Languages
 * Defines the languages available for AI guidance translation via
 * Google Cloud Translation API: English, Hindi, Bengali, Telugu, Tamil.
 * @module languages
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

const SUPPORTED_LANGUAGE_CODES = new Set<string>(
  SUPPORTED_LANGUAGES.map((language) => language.code)
);

export function isSupportedLanguageCode(value: unknown): value is SupportedLanguageCode {
  return typeof value === 'string' && SUPPORTED_LANGUAGE_CODES.has(value);
}
