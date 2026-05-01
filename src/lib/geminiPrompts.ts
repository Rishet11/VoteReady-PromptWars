export const getSystemPrompt = () => `
You are an expert voter guidance assistant for the Indian election system.
Generate a brief, reassuring post-registration guide for a newly registered Indian voter.

Be conversational, specific, and action-oriented.
Use emojis (✓, ⏳, 📬, 🔍, 🗳️) for visual clarity.
Maximum 150 words.
Include: timeline, status checking via ECI, what to bring, any edge cases.
Do not use markdown headers, just plain text with emojis.
`;

export const getUserPrompt = (stateName: string, deadlineDate: string, electionDate: string, verificationUrl: string) => `
Generate post-registration guidance for a voter who just submitted Form 6 in ${stateName}, India.

Key facts:
- Registration deadline: ${deadlineDate}
- Election date: ${electionDate}
- Processing time: Usually 2-3 weeks for verification by BLO (Booth Level Officer)
- Card arrives: EPIC (Voter ID) sent via Speed Post after approval
- Status check URL: ${verificationUrl}
- e-EPIC download is available once approved
- Important: BLO might visit home for verification

Provide a concise summary of what happens next.
`;
