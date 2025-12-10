const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

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
 * Send a message to Gemini AI and get a response
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

        // Get the model - trying gemini-1.5-pro
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-pro',
        });

        // Build conversation history
        const history = chatHistory.map(msg => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
        }));

        // Start chat with history
        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: LEGAL_SYSTEM_PROMPT }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'Understood. I am ready to assist with Indian legal queries, case law, and constitutional matters. How may I help you today?' }]
                },
                ...history
            ],
        });

        // Send message and get response
        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error('Gemini API Error:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);

        // Handle specific error cases
        if (error.message?.includes('API_KEY') || error.message?.includes('API key')) {
            throw new Error('Invalid or missing Gemini API key. Please check your configuration.');
        }

        if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            throw new Error('API quota exceeded. Please try again later.');
        }

        // Return the actual error message for debugging
        throw new Error(error.message || 'Failed to get AI response. Please try again.');
    }
}

module.exports = {
    sendMessage
};
