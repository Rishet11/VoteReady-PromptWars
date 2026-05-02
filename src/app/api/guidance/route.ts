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

export async function POST(request: Request) {
  const startTime = Date.now();
  let requestedLanguage: SupportedLanguageCode = 'en';

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const sanitizedStateCode = sanitizeInput(
      typeof body.stateCode === 'string' ? body.stateCode : ''
    );
    const language = body.language ?? 'en';

    if (!isSupportedLanguageCode(language)) {
      return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
    }
    requestedLanguage = language;

    if (!sanitizedStateCode || !electionData[sanitizedStateCode]) {
      return NextResponse.json(
        { error: 'Invalid or missing state code' },
        { status: 400 }
      );
    }

    const cacheKey = `${sanitizedStateCode}:${language}`;
    const cached = getCachedGuidance(cacheKey);
    if (cached) {
      logCloudEvent({
        event: 'cache_hit',
        stateCode: sanitizedStateCode,
        language,
        durationMs: Date.now() - startTime,
      });

      return guidanceJson({ ...cached, cached: true });
    }

    const stateInfo = electionData[sanitizedStateCode];
    const generatedGuidance = await withTimeout(
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
      language: requestedLanguage,
      translated: requestedLanguage === 'en',
      source: 'standard',
    });
  }
}

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
