import { NextResponse } from 'next/server';
import { getGeminiModel } from '@/lib/geminiClient';
import { getSystemPrompt, getUserPrompt } from '@/lib/geminiPrompts';
import { electionData } from '@/data/electionData';
import { sanitizeInput } from '@/lib/sanitize';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let { stateCode } = body;
    
    // Sanitize input
    stateCode = sanitizeInput(stateCode);

    if (!stateCode || !electionData[stateCode]) {
      return NextResponse.json(
        { error: 'Invalid or missing state code' },
        { status: 400 }
      );
    }

    const stateInfo = electionData[stateCode];
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
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout

    try {
      const chat = model.startChat({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
          role: 'system'
        }
      });
      
      const result = await chat.sendMessage(prompt);
      clearTimeout(timeoutId);
      
      const responseText = result.response.text();

      return NextResponse.json({ guidance: responseText });
    } catch (apiError: unknown) {
      clearTimeout(timeoutId);
      if (apiError instanceof Error && apiError.name === 'AbortError') {
        throw new Error('Gemini API timeout');
      }
      throw apiError;
    }
    // Intentionally prefixed with _ to indicate an unused error parameter 
    // while maintaining resilience and satisfying strict linting.
  } catch (_error: unknown) {
    // Return fallback guidance in case of any error (timeout or otherwise)
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
