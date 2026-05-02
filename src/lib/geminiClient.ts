import { GoogleGenAI } from '@google/genai';

const DEFAULT_GEMINI_MODEL = 'gemini-3-flash-preview';

let genAI: GoogleGenAI | null = null;

function getGeminiClient() {
  genAI ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  return genAI;
}

export function getGeminiModelName() {
  return process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
}

export async function generateGuidance(systemInstruction: string, prompt: string): Promise<string> {
  const response = await getGeminiClient().models.generateContent({
    model: getGeminiModelName(),
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.3,
    },
  });


  const text = response.text?.trim() || '';
  
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
