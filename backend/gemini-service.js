const { generateText } = require('ai');
const { google } = require('@ai-sdk/google');

// System prompt for legal context
const LEGAL_SYSTEM_PROMPT = `You are a knowledgeable Indian legal assistant specializing in Indian law, including the Constitution of India, Indian Penal Code (IPC), Bharatiya Nyaya Sanhita (BNS 2023), and landmark Supreme Court cases.

Your role:
- Help users understand Indian legal concepts, statutes, and case law
- When asked about a legal topic, provide relevant case names and brief descriptions
- When asked about specific cases, provide detailed information including year, judges, key points, and significance
- Focus on Indian legal system (Constitution, IPC, BNS, CrPC, CPC, etc.)
- Be accurate, educational, and cite sources when possible
- Keep responses concise but informative

Format your responses clearly with proper structure when listing cases or providing details.`;

/**
 * Send a message to Gemini AI via Vercel AI SDK
 * @param {string} message - User's message
 * @param {Array} chatHistory - Previous chat messages for context
 * @returns {Promise<string>} - AI response
 */
async function sendMessage(message, chatHistory = []) {
    try {
        // Check if API key is configured
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY not configured in environment variables');
        }

        console.log('Using Vercel AI SDK with Google Provider...');

        // Convert chat history to Vercel SDK format if needed, 
        // but generateText is stateless mostly, so we just append context or use messages if using streamText (but we want simple text here)
        // For simple generateText, we can just prepend history as context or use the 'messages' parameter if supported, 
        // but generateText is single-turn oriented or takes a system prompt.
        // Better approach: Construct a prompt with history manually or use the multi-shot prompt.

        // Simple context construction
        let fullPrompt = message;
        if (chatHistory.length > 0) {
            fullPrompt = "Chat History:\n" + chatHistory.map(m => `${m.role}: ${m.content}`).join("\n") + "\n\nUser: " + message;
        }

        const { text } = await generateText({
            model: google('gemini-1.5-flash'), // or gemini-pro
            system: LEGAL_SYSTEM_PROMPT,
            prompt: fullPrompt,
            apiKey: process.env.GEMINI_API_KEY
        });

        return text;

    } catch (error) {
        console.error('Vercel AI SDK Error:', error);

        if (error.message?.includes('API_KEY')) {
            throw new Error('Invalid or missing API key.');
        }

        throw new Error(error.message || 'Failed to get AI response.');
    }
}

module.exports = {
    sendMessage
};
