import { OpenRouter } from '@openrouter/sdk';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Initialize OpenRouter SDK
const openRouter = new OpenRouter({
    apiKey: OPENROUTER_API_KEY,
    defaultHeaders: {
        'HTTP-Referer': 'https://cityoftruth.com',
        'X-Title': 'City of Truth Ministries AI',
    },
});

export const SYSTEM_PROMPT = `You are the COT AI Assistant for City of Truth Ministries (சத்திய நகரம் ஊழியங்கள்), a Christian ministry based in Valparai, Tamil Nadu, India.

Your purpose is to provide biblical wisdom, spiritual guidance, and information about the ministry with intelligence, depth, and compassion.

Core Guidelines:
- Provide thoughtful, well-reasoned biblical answers citing scripture when relevant
- Balance theological depth with accessibility
- Be warm, encouraging, and pastoral in tone
- For ministry-specific questions, reference our location in Valparai and our focus on truth-centered teaching
- When unsure, acknowledge limitations humbly and point users to pastoral guidance`;

// Default model: OpenAI GPT-4o Mini (reliable & fast)
const DEFAULT_MODEL = 'openai/gpt-4o-mini';

/**
 * Generate AI response using OpenRouter SDK (non-streaming)
 */
export async function generateSpatulaAIResponse(userPrompt: string): Promise<string> {
    try {
        const completion = await openRouter.chat.send({
            model: DEFAULT_MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt }
            ],
            stream: false,
        });

        return completion.choices[0].message.content || 'I apologize, but I could not generate a response.';
    } catch (error) {
        console.error('OpenRouter API Error:', error);
        throw new Error('Failed to connect to AI service. Please try again.');
    }
}

/**
 * Stream AI response using OpenRouter SDK (real-time word-by-word)
 */
export async function streamSpatulaAIResponse(
    userPrompt: string,
    onChunk: (text: string) => void
): Promise<void> {
    try {
        const stream = await openRouter.chat.send({
            model: DEFAULT_MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt }
            ],
            stream: true,
        });

        // Process streaming chunks
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                onChunk(content);
            }
        }
    } catch (error) {
        console.error('OpenRouter Streaming Error:', error);
        throw new Error('Failed to stream AI response. Please try again.');
    }
}
