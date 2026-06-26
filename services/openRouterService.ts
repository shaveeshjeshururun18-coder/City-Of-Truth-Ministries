import { OpenRouter } from '@openrouter/sdk';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Initialize OpenRouter SDK
const openRouter = new OpenRouter({
    apiKey: OPENROUTER_API_KEY,
    httpReferer: 'https://cityoftruth.com',
    xTitle: 'City of Truth Ministries AI',
});

export const SYSTEM_PROMPT = `You are the COT AI Assistant for City of Truth Ministries (சத்திய நகரம் ஊழியங்கள்), a Christian ministry based in Valparai, Tamil Nadu, India.

Your purpose is to provide biblical wisdom, spiritual guidance, and information about the ministry with intelligence, depth, and compassion.

Core Guidelines:
- Provide thoughtful, well-reasoned biblical answers citing scripture when relevant
- Balance theological depth with accessibility
- Be warm, encouraging, and pastoral in tone
- For ministry-specific questions, reference our location in Valparai and our focus on truth-centered teaching
- When unsure, acknowledge limitations humbly and point users to pastoral guidance
- Website Navigation: Help users navigate to any page by explaining the menu structure (Home, Hebrew Resources, Ministries, Pastor, Valparai, Contact, AI Assistance, etc.).
- Registration & Custom Features: When asked how to register or access custom features, explain the steps clearly: 1) Click 'Register' or 'Login' in the navigation menu, 2) Fill out the member form with details, 3) Submit and wait for Admin approval. Once approved, members get access to a custom User Dashboard, printable Entrust ID cards, and personalized spiritual tools.`;

// Default model: OpenAI GPT-4o Mini (reliable, fast, and supports vision/image_url content)
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

        const content = completion.choices[0].message.content;
        if (typeof content === 'string') {
            return content || 'I apologize, but I could not generate a response.';
        } else if (Array.isArray(content)) {
            // Handle array of content parts
            return content.map(part => {
                if ('text' in part) return part.text;
                return '';
            }).join('') || 'I apologize, but I could not generate a response.';
        }

        return 'I apologize, but I could not generate a response.';
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
/**
 * Analyze an image and return a text description / extracted text
 */
export async function analyzeImageWithAI(
    base64Image: string,
    mimeType: string = 'image/jpeg'
): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://cityoftruth.com',
            'X-Title': 'City of Truth Ministries AI',
        },
        body: JSON.stringify({
            model: DEFAULT_MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: { url: `data:${mimeType};base64,${base64Image}` },
                        },
                        {
                            type: 'text',
                            text: 'Please analyze this image. Extract and share any text you see in it (OCR). Describe what is shown. If the image contains scripture, prayers, or ministry content, provide relevant spiritual context.',
                        },
                    ],
                },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(`Image analysis failed: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content.map((p: any) => (typeof p === 'string' ? p : p.text ?? '')).join('');
    }
    return 'Unable to analyze the image. Please try again.';
}

/**
 * Analyze a Hebrew word and return structured data (meanings, syllables, spiritual significance)
 */
export async function analyzeHebrewWord(word: string): Promise<any> {
    const prompt = `Analyze the Hebrew word "${word}". Provide the following details in JSON format only:
    {
        "pronunciation": "English phonetic spelling",
        "pronunciationTa": "Tamil phonetic spelling",
        "breakdownHe": "Hebrew syllable breakdown (dash-separated)",
        "breakdownEn": "English syllable breakdown (dash-separated)",
        "meaningEn": "Short English meaning",
        "meaningTa": "Short Tamil meaning (தமிழ்)",
        "root": "The three-letter Hebrew root (Shoresh) of the word",
        "description": "One sentence summary of spiritual or biblical significance"
    }
    Ensure the Tamil is accurate and culturally relevant for a Christian ministry context.`;

    try {
        const completion = await openRouter.chat.send({
            model: DEFAULT_MODEL,
            messages: [
                { role: 'system', content: 'You are an expert in Biblical Hebrew and Tamil translations. Respond only with valid JSON.' },
                { role: 'user', content: prompt }
            ],
            stream: false,
            responseFormat: { type: 'json_object' }
        });

        const content = completion.choices[0].message.content;
        return JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
    } catch (error) {
        console.error('Hebrew Analysis Error:', error);
        throw new Error('Failed to analyze word. Please check your AI configuration.');
    }
}
