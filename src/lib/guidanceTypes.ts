/**
 * Guidance API response types shared between the API route and client components.
 * @module guidanceTypes
 */

import type { SupportedLanguageCode } from './languages';

export type GuidanceSource = 'gemini' | 'standard';

export interface GuidanceResponse {
  readonly guidance: string;
  readonly fallback: boolean;
  readonly cached: boolean;
  readonly language: SupportedLanguageCode;
  readonly translated: boolean;
  readonly source: GuidanceSource;
}
