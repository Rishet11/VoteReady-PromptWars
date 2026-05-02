import { VertexAI } from '@google-cloud/vertexai';

const DEFAULT_GEMINI_MODEL = 'gemini-3-flash-preview';
const location = 'asia-south1'; // Matches the region in the Cloud Run URL

let vertexAI: VertexAI | null = null;

function getVertexClient() {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
  if (!projectId) {
    throw new Error('GOOGLE_CLOUD_PROJECT_ID is not set');
  }
  vertexAI ??= new VertexAI({ project: projectId, location });
  return vertexAI;
}

export function getGeminiModelName() {
  return process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
}

export async function generateGuidance(systemInstruction: string, prompt: string): Promise<string> {
  const generativeModel = getVertexClient().getGenerativeModel({
    model: getGeminiModelName(),
    systemInstruction,
    generationConfig: {
      temperature: 0.3,
    },
  });

  const response = await generativeModel.generateContent(prompt);
  const result = await response.response;
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  
  if (text) {
    console.info(JSON.stringify({
      severity: 'INFO',
      message: 'Gemini service heartbeat: Guidance generated',
      service: 'gemini-3-flash',
      status: 'success',
      timestamp: new Date().toISOString(),
    }));
  }

  return text;
}
