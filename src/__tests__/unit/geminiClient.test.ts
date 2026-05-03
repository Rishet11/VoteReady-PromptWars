import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VertexAI } from '@google-cloud/vertexai';

vi.mock('@google-cloud/vertexai', () => {
  return {
    VertexAI: vi.fn().mockImplementation(function() {
      return {
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: vi.fn().mockResolvedValue({
            response: Promise.resolve({
              candidates: [{ content: { parts: [{ text: 'mock guidance' }] } }]
            })
          })
        })
      };
    })
  };
});

describe('geminiClient', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, GOOGLE_CLOUD_PROJECT_ID: 'test-project' };
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('throws error if GOOGLE_CLOUD_PROJECT_ID is missing', async () => {
    // We isolate this test by dynamically importing to get a fresh module instance
    // where vertexAI is null
    vi.resetModules();
    delete process.env.GOOGLE_CLOUD_PROJECT_ID;
    const { generateGuidance } = await import('@/lib/geminiClient');
    const result = await generateGuidance('sys', 'prompt');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect((result.error as Error).message).toContain('GOOGLE_CLOUD_PROJECT_ID is not set');
    }
  });

  it('returns default model name if not in env', async () => {
    vi.resetModules();
    delete process.env.GEMINI_MODEL;
    const { getGeminiModelName } = await import('@/lib/geminiClient');
    expect(getGeminiModelName()).toBe('gemini-3-flash-preview');
  });

  it('returns env model name if set', async () => {
    vi.resetModules();
    process.env.GEMINI_MODEL = 'custom-model';
    const { getGeminiModelName } = await import('@/lib/geminiClient');
    expect(getGeminiModelName()).toBe('custom-model');
  });

  it('generates guidance and logs success', async () => {
    vi.resetModules();
    const { generateGuidance } = await import('@/lib/geminiClient');
    const result = await generateGuidance('sys', 'prompt');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('mock guidance');
    }
    expect(console.info).toHaveBeenCalled();
  });

  it('handles empty response gracefully', async () => {
    vi.resetModules();
    const mockVertexAI = vi.mocked(VertexAI);
    mockVertexAI.mockImplementationOnce(function() {
      return {
        getGenerativeModel: () => ({
          generateContent: () => Promise.resolve({
            response: Promise.resolve({})
          })
        })
      } as unknown as VertexAI;
    });

    const { generateGuidance } = await import('@/lib/geminiClient');
    const result = await generateGuidance('sys', 'prompt');
    expect(result.ok).toBe(false);
    expect(console.info).not.toHaveBeenCalled();
  });
  
  it('handles missing text part gracefully', async () => {
    vi.resetModules();
    const mockVertexAI = vi.mocked(VertexAI);
    mockVertexAI.mockImplementationOnce(function() {
      return {
        getGenerativeModel: () => ({
          generateContent: () => Promise.resolve({
            response: Promise.resolve({
              candidates: [{ content: { parts: [{}] } }]
            })
          })
        })
      } as unknown as VertexAI;
    });

    const { generateGuidance } = await import('@/lib/geminiClient');
    const result = await generateGuidance('sys', 'prompt');
    expect(result.ok).toBe(false);
  });
});
