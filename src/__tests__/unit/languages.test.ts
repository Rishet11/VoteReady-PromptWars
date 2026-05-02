import { describe, expect, it } from 'vitest';
import { isSupportedLanguageCode, SUPPORTED_LANGUAGES } from '@/lib/languages';

describe('languages', () => {
  it('exposes the supported submission languages', () => {
    expect(SUPPORTED_LANGUAGES.map((language) => language.code)).toEqual([
      'en',
      'hi',
      'bn',
      'te',
      'ta',
    ]);
  });

  it('validates supported language codes', () => {
    expect(isSupportedLanguageCode('hi')).toBe(true);
    expect(isSupportedLanguageCode('fr')).toBe(false);
    expect(isSupportedLanguageCode(undefined)).toBe(false);
  });
});
