import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TranslationServiceClient } from '@google-cloud/translate';

vi.mock('@google-cloud/translate', () => {
  return {
    TranslationServiceClient: vi.fn().mockImplementation(function() {
      return {
        translateText: vi.fn().mockResolvedValue([{
          translations: [{ translatedText: 'mock translation' }]
        }])
      };
    })
  };
});

describe('translateText', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, GOOGLE_CLOUD_PROJECT_ID: 'test-project' };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('fails if GOOGLE_CLOUD_PROJECT_ID is missing', async () => {
    vi.resetModules();
    delete process.env.GOOGLE_CLOUD_PROJECT_ID;
    const { translateText } = await import('@/lib/translate');
    const result = await translateText('text', 'hi');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("Translation failed: Missing Project ID");
    }
  });

  it('returns translation on success', async () => {
    vi.resetModules();
    const { translateText } = await import('@/lib/translate');
    const result = await translateText('text', 'hi');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.text).toBe('mock translation');
      expect(result.value.translated).toBe(true);
    }
  });

  it('fails if no translation is returned', async () => {
    vi.resetModules();
    const mockTranslationServiceClient = vi.mocked(TranslationServiceClient);
    mockTranslationServiceClient.mockImplementationOnce(function() {
      return {
        translateText: vi.fn().mockResolvedValue([{ translations: [] }])
      } as unknown as TranslationServiceClient;
    });
    const { translateText } = await import('@/lib/translate');
    const result = await translateText('text', 'hi');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("Translation failed: No translation returned");
    }
  });

  it('fails on service error', async () => {
    vi.resetModules();
    const mockTranslationServiceClient = vi.mocked(TranslationServiceClient);
    mockTranslationServiceClient.mockImplementationOnce(function() {
      return {
        translateText: vi.fn().mockRejectedValue(new Error('Service failure'))
      } as unknown as TranslationServiceClient;
    });
    const { translateText } = await import('@/lib/translate');
    const result = await translateText('text', 'hi');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("Translation service failed");
      expect(result.error?.message).toBe("Service failure");
    }
  });

  it('handles non-Error thrown during service call', async () => {
    vi.resetModules();
    const mockTranslationServiceClient = vi.mocked(TranslationServiceClient);
    mockTranslationServiceClient.mockImplementationOnce(function() {
      return {
        translateText: () => Promise.reject('String error')
      } as unknown as TranslationServiceClient;
    });
    const { translateText } = await import('@/lib/translate');
    const result = await translateText('text', 'hi');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("Translation service failed");
      expect(result.error?.message).toBe("String error");
    }
  });
});
