/**
 * Returns the system instruction prompt used to configure the Gemini model's persona
 * and output constraints for generating post-registration guidance.
 * @returns {string} The system prompt string.
 */
export const getSystemPrompt = () => `
You are an expert voter guidance assistant for the Indian election system.
Generate a brief, reassuring post-registration guide for a newly registered Indian voter.

Be conversational, specific, and action-oriented.
Use emojis (✓, ⏳, 📬, 🔍, 🗳️) for visual clarity.
Maximum 150 words.
Include: timeline, status checking via ECI, what to bring, any edge cases.
Do not use markdown headers, just plain text with emojis.
`;

/**
 * Generates the user prompt with specific election facts to be processed by the model.
 * 
 * @param {string} stateName - The name of the Indian state.
 * @param {string} deadlineDate - The voter registration deadline.
 * @param {string} electionDate - The upcoming election date.
 * @param {string} verificationUrl - The official URL to check registration status.
 * @returns {string} The user prompt string injected with election metadata.
 */
export const getUserPrompt = (stateName: string, deadlineDate: string, electionDate: string, verificationUrl: string) => `
Generate post-registration guidance for a voter who just submitted Form 6 in ${stateName}, India.

Key facts:
- Registration deadline: ${deadlineDate}
- Election date: ${electionDate}
- Processing time: 5 business days for verification by BLO (Booth Level Officer)
- Card arrives: EPIC (Voter ID) sent via Speed Post after approval
- Status check URL: ${verificationUrl}
- e-EPIC download is available once approved
- Important: BLO might visit home for verification

Provide a concise summary of what happens next.
`;
