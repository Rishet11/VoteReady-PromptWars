import { NextResponse } from 'next/server';
import { generateGuidance } from '@/lib/geminiClient';
import { getSystemPrompt, getUserPrompt } from '@/lib/geminiPrompts';
import { electionData } from '@/data/electionData';
import { sanitizeInput } from '@/lib/sanitize';
import { translateText } from '@/lib/translate';
import {
  isSupportedLanguageCode,
  type SupportedLanguageCode,
} from '@/lib/languages';
import { getCachedGuidance, setCachedGuidance } from '@/lib/guidanceCache';
import type { GuidanceResponse } from '@/lib/guidanceTypes';

export const runtime = 'nodejs';

const CACHE_TTL_MS = 60 * 60 * 1000;
const GEMINI_TIMEOUT_MS = 5000;

const STANDARD_FALLBACK_GUIDANCE = `
You're heading to the registration portal.

After you register, here's what happens:

✓ Keep your application reference ID safe
⏳ Verification takes 2-3 weeks by your local BLO
📬 EPIC (Voter ID) arrives via Speed Post
🔍 Track status at electoralsearch.eci.gov.in
🗳️ Bring valid ID to polls on election day

Questions? Call the Voter Helpline at 1950.
`.trim();

function guidanceJson(response: GuidanceResponse) {
  return NextResponse.json(response, {
    headers: { 'Cache-Control': response.cached ? 'public, s-maxage=3600' : 'no-store' },
  });
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}

function logCloudEvent(data: Record<string, unknown>) {
  console.info(
    JSON.stringify({
      severity: 'INFO',
      message: `Guidance API event: ${data.event}`,
      ...data,
      timestamp: new Date().toISOString(),
    })
  );
}

async function parseGuidanceRequest(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const sanitizedStateCode = sanitizeInput(
    typeof body.stateCode === 'string' ? body.stateCode : ''
  );
  const language = typeof body.language === 'string' ? body.language : 'en';

  if (!isSupportedLanguageCode(language)) {
    return { error: 'Unsupported language', status: 400 };
  }

  if (!sanitizedStateCode || !electionData[sanitizedStateCode]) {
    return { error: 'Invalid or missing state code', status: 400 };
  }

  return { sanitizedStateCode, language: language as SupportedLanguageCode };
}

async function fetchFromGemini(stateCode: string): Promise<string | null> {
  const stateInfo = electionData[stateCode];
  if (!stateInfo) return null;
  
  return withTimeout(
    generateGuidance(
      getSystemPrompt(),
      getUserPrompt(
        stateInfo.name,
        stateInfo.deadline,
        stateInfo.electionDate,
        stateInfo.verificationUrl
      )
    ),
    GEMINI_TIMEOUT_MS,
    'Gemini API timeout'
  );
}

async function processGuidance(stateCode: string, language: SupportedLanguageCode): Promise<GuidanceResponse> {
  const generatedGuidance = await fetchFromGemini(stateCode);
  
  let response: GuidanceResponse = {
    guidance: generatedGuidance || STANDARD_FALLBACK_GUIDANCE,
    fallback: !generatedGuidance,
    cached: false,
    language,
    translated: language === 'en',
    source: generatedGuidance ? 'gemini' : 'standard',
  };

  if (language !== 'en' && generatedGuidance) {
    const translation = await translateText(generatedGuidance, language);
    response = {
      ...response,
      guidance: translation.text,
      translated: translation.translated,
    };
  }

  return response;
}

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    const parsedRequest = await parseGuidanceRequest(request);
    if ('error' in parsedRequest) {
      return NextResponse.json({ error: parsedRequest.error }, { status: parsedRequest.status });
    }
    
    const { sanitizedStateCode, language } = parsedRequest;
    const cacheKey = `${sanitizedStateCode}:${language}`;
    const cached = getCachedGuidance(cacheKey);

    if (cached) {
      logCloudEvent({ event: 'cache_hit', stateCode: sanitizedStateCode, language, durationMs: Date.now() - startTime });
      return guidanceJson({ ...cached, cached: true });
    }

    const response = await processGuidance(sanitizedStateCode, language);

    if (!response.fallback && response.translated) {
      setCachedGuidance(cacheKey, response, CACHE_TTL_MS);
    }

    logCloudEvent({
      event: 'api_success',
      stateCode: sanitizedStateCode,
      language,
      translated: response.translated,
      source: response.source,
      durationMs: Date.now() - startTime,
    });

    return guidanceJson(response);
  } catch (error: unknown) {
    logCloudEvent({
      event: 'api_fallback',
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs: Date.now() - startTime,
    });

    return guidanceJson({
      guidance: STANDARD_FALLBACK_GUIDANCE,
      fallback: true,
      cached: false,
      language: 'en',
      translated: true,
      source: 'standard',
    });
  }
}
