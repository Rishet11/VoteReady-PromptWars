import { TranslationServiceClient } from '@google-cloud/translate';
import type { SupportedLanguageCode } from './languages';

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

export async function translateText(
  text: string,
  targetLanguageCode: Exclude<SupportedLanguageCode, 'en'>
): Promise<TranslationResult> {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  if (!projectId) {
    return { text, translated: false };
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
      const translatedText = response.translations[0].translatedText;
      return translatedText
        ? { text: translatedText, translated: true }
        : { text, translated: false };
    }

    return { text, translated: false };
  } catch {
    return { text, translated: false };
  }
}
