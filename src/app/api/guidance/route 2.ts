import { NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/geminiClient';
import { getSystemPrompt, getUserPrompt } from '@/lib/geminiPrompts';
import { electionData } from '@/data/electionData';
import { sanitizeInput } from '@/lib/sanitize';
import { translateText } from '@/lib/translate';

// Simple in-memory cache for demo/hackathon efficiency
// In production, use Redis/Memorystore
const cache = new Map<string, { guidance: string; expiry: number }>();
const CACHE_TTL = 3600000; // 1 hour

export async function POST(request: Request) {
  const startTime = Date.now();
  try {
    const body = await request.json();
    const { stateCode, language = 'en' } = body;
    
    // Sanitize input
    const sanitizedStateCode = sanitizeInput(stateCode);
    const cacheKey = `${sanitizedStateCode}_${language}`;

    // 1. Check Cache
    const cached = cache.get(cacheKey);
    if (cached && cached.expiry > Date.now()) {
      logBigQuery({
        event: 'cache_hit',
        stateCode: sanitizedStateCode,
        language,
        duration: Date.now() - startTime
      });
      
      return NextResponse.json(
        { guidance: cached.guidance, cached: true },
        { headers: { 'Cache-Control': 'public, s-maxage=3600' } }
      );
    }

    if (!sanitizedStateCode || !electionData[sanitizedStateCode]) {
      return NextResponse.json(
        { error: 'Invalid or missing state code' },
        { status: 400 }
      );
    }

    const stateInfo = electionData[sanitizedStateCode];
    const model = getGeminiModel();

    const systemInstruction = getSystemPrompt();
    const prompt = getUserPrompt(
      stateInfo.name, 
      stateInfo.deadline, 
      stateInfo.electionDate, 
      stateInfo.verificationUrl
    );

    // Call Gemini API with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const chat = model.startChat({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
          role: 'system'
        }
      });
      
      const result = await chat.sendMessage(prompt);
      clearTimeout(timeoutId);
      
      let responseText = result.response.text();

      // 2. Translate if requested
      if (language !== 'en') {
        responseText = await translateText(responseText, language);
      }

      // 3. Update Cache
      cache.set(cacheKey, {
        guidance: responseText,
        expiry: Date.now() + CACHE_TTL
      });

      logBigQuery({
        event: 'api_success',
        stateCode: sanitizedStateCode,
        language,
        duration: Date.now() - startTime,
        service: 'gemini + translate'
      });

      return NextResponse.json(
        { guidance: responseText },
        { headers: { 'Cache-Control': 'public, s-maxage=3600' } }
      );
    } catch (apiError: unknown) {
      clearTimeout(timeoutId);
      throw apiError;
    }
  } catch (error: unknown) {
    logBigQuery({
      event: 'api_error',
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    });

    const fallbackGuidance = `
You're heading to the registration portal.

After you register, here's what happens:

✓ Keep your application reference ID safe
⏳ Verification takes 2-3 weeks by your local BLO
📬 EPIC (Voter ID) arrives via Speed Post
🔍 Track status at electoralsearch.eci.gov.in
🗳️ Bring valid ID to polls on election day

Questions? Call the Voter Helpline at 1950.
    `.trim();
    
    return NextResponse.json({ 
      guidance: fallbackGuidance,
      fallback: true
    });
  }
}

// Structured logging helper for BigQuery/Cloud Logging alignment
function logBigQuery(data: Record<string, unknown>) {
  console.log(JSON.stringify({
    severity: 'INFO',
    message: `API Guidance Event: ${data.event}`,
    ...data,
    timestamp: new Date().toISOString(),
  }));
}
