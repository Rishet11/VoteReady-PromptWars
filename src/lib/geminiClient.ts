/**
 * Gemini AI Client
 * Provides access to Google Gemini 3 Flash (Preview) via Vertex AI for generating
 * personalized voter registration guidance.
 * @module geminiClient
 */

import { VertexAI } from '@google-cloud/vertexai';
import { VERTEX_AI_REGION } from './constants/geo';
import { logger } from './logger';
import { Result, ok, err } from './result';

const DEFAULT_GEMINI_MODEL = 'gemini-3-flash-preview';

let vertexAI: VertexAI | null = null;

function getVertexClient() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  if (!projectId) {
    throw new Error('GOOGLE_CLOUD_PROJECT_ID is not set');
  }
  vertexAI ??= new VertexAI({ project: projectId, location: VERTEX_AI_REGION });
  return vertexAI;
}

/** Returns the configured Gemini model name from environment or the default. */
export function getGeminiModelName() {
  return process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
}

interface GeminiCandidate {
  content?: {
    parts?: Array<{ text?: string }>;
  };
}

interface GeminiResponse {
  candidates?: GeminiCandidate[];
}

function getPartsFromResponse(result: GeminiResponse) {
  return result.candidates?.[0]?.content?.parts;
}

function extractTextFromResult(result: GeminiResponse): string {
  const parts = getPartsFromResponse(result);
  const part = parts?.[0];
  return part?.text?.trim() || '';
}

/**
 * Generates post-registration voter guidance using Google Gemini.
 * Uses Vertex AI to ensure production-grade security and low latency.
 * 
 * @param systemInstruction - The system prompt defining the AI's persona and constraints.
 * @param prompt - The user-facing prompt with state-specific election details.
 * @returns Result with generated guidance text, or err on failure.
 */
export async function generateGuidance(systemInstruction: string, prompt: string): Promise<Result<string>> {
  try {
    const generativeModel = getVertexClient().getGenerativeModel({
    model: getGeminiModelName(),
    systemInstruction,
    generationConfig: {
      temperature: 0.3,
    },
  });

  const response = await generativeModel.generateContent(prompt);
  const text = extractTextFromResult(await response.response);
  
  if (text) {
    logger.info({
      message: 'Gemini service heartbeat: Guidance generated',
      service: getGeminiModelName(),
      status: 'success',
    });
    return ok(text);
  }

  return err('Gemini returned empty response');
} catch (error) {
  return err(
    'Gemini request failed',
    error instanceof Error ? error : new Error(String(error))
  );
}
}

