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
import { logger } from '@/lib/logger';
import { apiResponse } from '@/lib/apiResponse';
import { CACHE_HEADERS } from '@/lib/constants/headers';
import { Result, ok, err } from '@/lib/result';

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

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}

async function parseGuidanceRequest(request: Request): Promise<Result<{ sanitizedStateCode: string; language: SupportedLanguageCode }>> {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const sanitizedStateCode = sanitizeInput(
      typeof body.stateCode === 'string' ? body.stateCode : ''
    );
    const language = typeof body.language === 'string' ? body.language : 'en';

    if (!isSupportedLanguageCode(language)) {
      return err('Unsupported language');
    }

    if (!sanitizedStateCode || !electionData[sanitizedStateCode]) {
      return err('Invalid or missing state code');
    }

    return ok({ sanitizedStateCode, language: language as SupportedLanguageCode });
  } catch {
    return err('Invalid JSON body');
  }
}

async function fetchFromGemini(stateCode: string): Promise<Result<string>> {
  const stateInfo = electionData[stateCode];
  if (!stateInfo) return err('State info not found');
  
  try {
    const guidance = await withTimeout(
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
    return ok(guidance);
  } catch (error) {
    return err('Gemini fetch failed', error instanceof Error ? error : new Error(String(error)));
  }
}

async function processGuidance(stateCode: string, language: SupportedLanguageCode): Promise<GuidanceResponse> {
  const geminiResult = await fetchFromGemini(stateCode);
  const generatedGuidance = geminiResult.ok ? geminiResult.value : null;
  
  let response: GuidanceResponse = {
    guidance: generatedGuidance || STANDARD_FALLBACK_GUIDANCE,
    fallback: !generatedGuidance,
    cached: false,
    language,
    translated: language === 'en',
    source: generatedGuidance ? 'gemini' : 'standard',
  };

  if (language !== 'en' && generatedGuidance) {
    const translationResult = await translateText(generatedGuidance, language);
    if (translationResult.ok) {
      response = {
        ...response,
        guidance: translationResult.value.text,
        translated: translationResult.value.translated,
      };
    }
  }

  return response;
}

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    const parsedResult = await parseGuidanceRequest(request);
    if (!parsedResult.ok) {
      return apiResponse.badRequest(parsedResult.message, CACHE_HEADERS.NO_STORE);
    }
    
    const { sanitizedStateCode, language } = parsedResult.value;
    const cacheKey = `${sanitizedStateCode}:${language}`;
    const cached = getCachedGuidance(cacheKey);

    if (cached) {
      logger.info({ event: 'cache_hit', message: 'Guidance API event: cache_hit', stateCode: sanitizedStateCode, language, durationMs: Date.now() - startTime });
      return apiResponse.ok({ ...cached, cached: true }, CACHE_HEADERS.PUBLIC_LONG);
    }

    const response = await processGuidance(sanitizedStateCode, language);

    if (!response.fallback && response.translated) {
      setCachedGuidance(cacheKey, response, CACHE_TTL_MS);
    }

    logger.info({
      event: 'api_success',
      message: 'Guidance API event: api_success',
      stateCode: sanitizedStateCode,
      language,
      translated: response.translated,
      source: response.source,
      durationMs: Date.now() - startTime,
    });

    return apiResponse.ok(response, CACHE_HEADERS.NO_STORE);
  } catch (error: unknown) {
    logger.error({
      event: 'api_fallback',
      message: 'Guidance API event: api_fallback',
      error: error instanceof Error ? error.message : 'Unknown error',
      durationMs: Date.now() - startTime,
    });

    return apiResponse.ok({
      guidance: STANDARD_FALLBACK_GUIDANCE,
      fallback: true,
      cached: false,
      language: 'en',
      translated: true,
      source: 'standard',
    }, CACHE_HEADERS.NO_STORE);
  }
}
