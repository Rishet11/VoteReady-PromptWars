/**
 * Google Cloud Translation API Client
 * Translates AI-generated guidance into supported Indian languages
 * (Hindi, Bengali, Telugu, Tamil) with timeout and graceful fallback.
 * @module translate
 */

import { TranslationServiceClient } from '@google-cloud/translate';
import type { SupportedLanguageCode } from './languages';
import { Result, ok, err } from './result';

const location = 'global';
const TRANSLATION_TIMEOUT_MS = 3000;

let translationClient: TranslationServiceClient | null = null;

export interface TranslationResult {
  text: string;
  translated: boolean;
}

function getTranslationClient() {
  translationClient ??= new TranslationServiceClient();
  return translationClient;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}

/**
 * Translates text to a supported Indian language using Google Cloud Translation API.
 * Returns ok with translated result or err on failure.
 * @param text - The English source text to translate.
 * @param targetLanguageCode - The target language code (hi, bn, te, ta).
 */
export async function translateText(
  text: string,
  targetLanguageCode: Exclude<SupportedLanguageCode, 'en'>
): Promise<Result<TranslationResult>> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  if (!projectId) {
    return err("Translation failed: Missing Project ID");
  }

  try {
    const request = {
      parent: `projects/${projectId}/locations/${location}`,
      contents: [text],
      mimeType: 'text/plain',
      sourceLanguageCode: 'en',
      targetLanguageCode,
    };

    const [response] = await withTimeout(
      getTranslationClient().translateText(request),
      TRANSLATION_TIMEOUT_MS,
      'Translation API timeout'
    );

    if (response.translations && response.translations.length > 0) {
      const translatedText = response.translations[0]?.translatedText;
      if (translatedText) {
        return ok({ text: translatedText, translated: true });
      }
    }

    return err("Translation failed: No translation returned");
  } catch (error) {
    return err(
      "Translation service failed",
      error instanceof Error ? error : new Error(String(error))
    );
  }
}
