import type { SupportedLanguageCode } from './languages';

export type GuidanceSource = 'gemini' | 'standard';

export interface GuidanceResponse {
  guidance: string;
  fallback: boolean;
  cached: boolean;
  language: SupportedLanguageCode;
  translated: boolean;
  source: GuidanceSource;
}
