import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/guidance/route';
import { generateGuidance } from '@/lib/geminiClient';
import { translateText } from '@/lib/translate';
import { clearGuidanceCacheForTests } from '@/lib/guidanceCache';

vi.mock('@/lib/geminiClient', () => ({
  generateGuidance: vi.fn(),
}));

vi.mock('@/lib/translate', () => ({
  translateText: vi.fn(),
}));

const mockGenerateGuidance = vi.mocked(generateGuidance);
const mockTranslateText = vi.mocked(translateText);

function guidanceRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/guidance', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function responseJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>;
}

describe('POST /api/guidance', () => {
  let consoleInfo: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    clearGuidanceCacheForTests();
    mockGenerateGuidance.mockReset();
    mockTranslateText.mockReset();
    consoleInfo = vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleInfo.mockRestore();
    vi.useRealTimers();
  });

  it('returns Gemini guidance for a valid state', async () => {
    mockGenerateGuidance.mockResolvedValue('Gemini guidance');

    const response = await POST(guidanceRequest({ stateCode: 'DL' }));
    const json = await responseJson(response);

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      guidance: 'Gemini guidance',
      fallback: false,
      cached: false,
      language: 'en',
      translated: true,
      source: 'gemini',
    });
  });

  it('translates Gemini guidance when a supported non-English language is requested', async () => {
    mockGenerateGuidance.mockResolvedValue('English guidance');
    mockTranslateText.mockResolvedValue({ ok: true, value: { text: 'Hindi guidance', translated: true } });

    const response = await POST(guidanceRequest({ stateCode: 'DL', language: 'hi' }));
    const json = await responseJson(response);

    expect(response.status).toBe(200);
    expect(mockTranslateText).toHaveBeenCalledWith('English guidance', 'hi');
    expect(json).toMatchObject({
      guidance: 'Hindi guidance',
      translated: true,
      language: 'hi',
      source: 'gemini',
    });
  });

  it('returns English when translation is unavailable', async () => {
    mockGenerateGuidance.mockResolvedValue('English guidance');
    mockTranslateText.mockResolvedValue({ ok: false, message: 'Translation failed', error: new Error('Translation failed') });

    const response = await POST(guidanceRequest({ stateCode: 'DL', language: 'hi' }));
    const json = await responseJson(response);

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      guidance: 'English guidance',
      fallback: false,
      translated: false,
      language: 'hi',
      source: 'gemini',
    });
  });

  it('returns standard fallback if Gemini times out', async () => {
    vi.useFakeTimers();
    mockGenerateGuidance.mockImplementation(() => new Promise(() => {}));

    const pendingResponse = POST(guidanceRequest({ stateCode: 'DL', language: 'hi' }));
    await vi.advanceTimersByTimeAsync(5000);
    const response = await pendingResponse;
    const json = await responseJson(response);

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      fallback: true,
      language: 'hi',
      translated: false,
      source: 'standard',
    });
  });

  it('rejects invalid state codes', async () => {
    const response = await POST(guidanceRequest({ stateCode: 'XX' }));
    const json = await responseJson(response);

    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid or missing state code');
  });

  it('rejects unsupported language codes', async () => {
    const response = await POST(guidanceRequest({ stateCode: 'DL', language: 'fr' }));
    const json = await responseJson(response);

    expect(response.status).toBe(400);
    expect(json.error).toBe('Unsupported language');
  });

  it('uses cache for repeated successful guidance requests', async () => {
    mockGenerateGuidance.mockResolvedValue('Cached guidance');

    await POST(guidanceRequest({ stateCode: 'DL' }));
    const response = await POST(guidanceRequest({ stateCode: 'DL' }));
    const json = await responseJson(response);

    expect(mockGenerateGuidance).toHaveBeenCalledTimes(1);
    expect(json).toMatchObject({
      guidance: 'Cached guidance',
      cached: true,
    });
  });

  it('handles invalid JSON body', async () => {
    const request = new Request('http://localhost/api/guidance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json',
    });
    
    const response = await POST(request);
    const json = await responseJson(response);
    
    expect(response.status).toBe(400);
    expect(json.error).toBe('Invalid JSON body');
  });

  it('handles non-Error thrown during Gemini fetch', async () => {
    mockGenerateGuidance.mockImplementation(() => {
      throw 'String Error';
    });

    const response = await POST(guidanceRequest({ stateCode: 'DL' }));
    const json = await responseJson(response);
    
    // It should fallback
    expect(response.status).toBe(200);
    expect(json.fallback).toBe(true);
  });

  it('handles unexpected errors in POST catch block', async () => {
    // We can force a throw inside POST by mocking translateText to throw synchronously,
    // or by mocking translateText to return a rejected promise that isn't caught.
    // Wait, processGuidance doesn't catch translateText errors!
    mockGenerateGuidance.mockResolvedValue('English');
    mockTranslateText.mockRejectedValue(new Error('Unexpected translation crash'));

    const response = await POST(guidanceRequest({ stateCode: 'DL', language: 'hi' }));
    const json = await responseJson(response);

    expect(response.status).toBe(200);
    expect(json.fallback).toBe(true);
    expect(json.source).toBe('standard');
  });
});
