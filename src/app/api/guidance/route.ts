import {
  generateGuidance,
  getSystemPrompt,
  getUserPrompt,
  sanitizeInput,
  translateText,
  isSupportedLanguageCode,
  type SupportedLanguageCode,
  getCachedGuidance,
  setCachedGuidance,
  type GuidanceResponse,
  logger,
  apiResponse,
  Result,
  ok,
  err,
  withTimeout
} from '@/lib';
import { electionData } from '@/data/electionData';
import { CACHE_HEADERS } from '@/lib/constants/headers';
import { GEMINI_TIMEOUT_MS } from '@/lib/constants/timeouts';
import { GUIDANCE_CACHE_TTL_MS } from '@/lib/constants/cache';
import {
  GUIDANCE_RATE_LIMIT_WINDOW_MS,
} from '@/lib/constants/rateLimit';
import { isRateLimited } from '@/lib/rateLimit';

export const runtime = 'nodejs';

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



async function extractRequestBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function extractStateCode(body: Record<string, unknown>): string {
  const rawStateCode = typeof body.stateCode === 'string' ? body.stateCode : '';
  return sanitizeInput(rawStateCode);
}

function extractLanguage(body: Record<string, unknown>): string {
  return typeof body.language === 'string' ? body.language : 'en';
}

function validateStateCode(stateCode: string): boolean {
  return Boolean(stateCode && electionData[stateCode]);
}

async function parseGuidanceRequest(request: Request): Promise<Result<{ sanitizedStateCode: string; language: SupportedLanguageCode }>> {
  const body = await extractRequestBody(request);
  if (!body) {
    return err('Invalid JSON body');
  }

  const sanitizedStateCode = extractStateCode(body);
  const language = extractLanguage(body);

  if (!isSupportedLanguageCode(language)) {
    return err('Unsupported language');
  }

  if (!validateStateCode(sanitizedStateCode)) {
    return err('Invalid or missing state code');
  }

  return ok({ sanitizedStateCode, language: language as SupportedLanguageCode });
}

async function fetchFromGemini(stateCode: string): Promise<Result<string>> {
  const stateInfo = electionData[stateCode];
  if (!stateInfo) return err(`fetchFromGemini: election data not found for state code: ${stateCode}`);

  try {
    return await withTimeout(
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
} catch (error) {
    return err('fetchFromGemini: Gemini API call failed for state: ' + stateCode, error instanceof Error ? error : new Error(String(error)));
  }
}

async function applyTranslationIfNeeded(
  response: GuidanceResponse,
  language: SupportedLanguageCode,
  generatedGuidance: string | null
): Promise<GuidanceResponse> {
  if (language === 'en' || !generatedGuidance) {
    return response;
  }

  const translationResult = await translateText(generatedGuidance, language);
  if (translationResult.ok) {
    return {
      ...response,
      guidance: translationResult.value.text,
      translated: translationResult.value.translated,
    };
  }

  return response;
}

async function processGuidance(stateCode: string, language: SupportedLanguageCode): Promise<GuidanceResponse> {
  const geminiResult = await fetchFromGemini(stateCode);
  const generatedGuidance = geminiResult.ok ? geminiResult.value : null;

  const response: GuidanceResponse = {
    guidance: generatedGuidance || STANDARD_FALLBACK_GUIDANCE,
    fallback: !generatedGuidance,
    cached: false,
    language,
    translated: language === 'en',
    source: generatedGuidance ? 'gemini' : 'standard',
  };

  return applyTranslationIfNeeded(response, language, generatedGuidance);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

function cacheResponseIfNeeded(response: GuidanceResponse, cacheKey: string) {
  if (response.fallback) return;
  if (!response.translated) return;
  setCachedGuidance(cacheKey, response, GUIDANCE_CACHE_TTL_MS);
}

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(Math.ceil(GUIDANCE_RATE_LIMIT_WINDOW_MS / 1000)),
      },
    });
  }

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

    cacheResponseIfNeeded(response, cacheKey);

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
      error: getErrorMessage(error),
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
