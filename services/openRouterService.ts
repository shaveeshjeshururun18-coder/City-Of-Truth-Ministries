const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export const SYSTEM_PROMPT = `You are the COT AI Assistant for City of Truth Ministries (சத்திய நகரம் ஊழியங்கள்), a Christian ministry based in Valparai, Tamil Nadu, India.

Your purpose is to provide biblical wisdom, spiritual guidance, and information about the ministry with intelligence, depth, and compassion.

Core Guidelines:
- Provide thoughtful, well-reasoned biblical answers citing scripture when relevant
- Balance theological depth with accessibility
- Be warm, encouraging, and pastoral in tone
- For ministry-specific questions, reference our location in Valparai and our focus on truth-centered teaching
- When unsure, acknowledge limitations humbly and point users to pastoral guidance
- Website Navigation: Help users navigate to any page by explaining the menu structure (Home, Hebrew Resources, Ministries, Pastor, Valparai, Contact, AI Assistance, etc.).
- Registration & Custom Features: When asked how to register or access custom features, explain the steps clearly: 1) Click 'Register' or 'Login' in the navigation menu, 2) Fill out the member form with details, 3) Submit and wait for Admin approval. Once approved, members get access to a custom User Dashboard, printable Entrust ID cards, and personalized spiritual tools.

CRITICAL INSTRUCTION - INTERACTIVE GUIDES:
If the user asks "how to" do something specific in the UI (e.g., "how to login", "how to register", "how to go to the wallpari page", "how to open admin dashboard", "how to find the pastor page", etc.), you MUST trigger an interactive UI tour.
To do this, append exactly one of the following command tags at the very end of your helpful response:
[TOUR:register] -> for registration help
[TOUR:login] -> for login help
[TOUR:wallpari] -> for navigating to Valparai page
[TOUR:pastor] -> for navigating to Pastor page
[TOUR:baruch_hashem] -> for navigating to Baruch Hashem page
[TOUR:admin] -> for opening the admin dashboard

Example: "To register for a member account, follow the step-by-step guide pointing to the buttons on your screen. [TOUR:register]"`;

// Default model: OpenAI GPT-OSS 20B (free, reliable)
const DEFAULT_MODEL = 'openai/gpt-oss-20b:free';
const FALLBACK_MODEL = 'openrouter/free';

export function getSelectedModel(): string {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage.getItem('cot_selected_openrouter_model') || DEFAULT_MODEL;
        }
    } catch (e) {
        console.warn('Failed to access localStorage for openrouter model:', e);
    }
    return DEFAULT_MODEL;
}

export function setSelectedOpenRouterModel(modelId: string): void {
    try {
        if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem('cot_selected_openrouter_model', modelId);
        }
    } catch (e) {
        console.error('Failed to save selected OpenRouter model:', e);
    }
}

/**
 * Helper to fetch chat completion from OpenRouter using fetch
 */
async function fetchOpenRouterCompletion(messages: any[], jsonFormat = false): Promise<any> {
    const headers = {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cityoftruth.com',
        'X-Title': 'City of Truth Ministries AI',
    };

    const makeRequest = async (model: string) => {
        const body: any = {
            model,
            messages,
        };
        if (jsonFormat) {
            body.response_format = { type: 'json_object' };
        }

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }

        return response.json();
    };

    const activeModel = getSelectedModel();
    try {
        return await makeRequest(activeModel);
    } catch (primaryError) {
        console.warn(`Primary model ${activeModel} failed, trying fallback ${FALLBACK_MODEL}:`, primaryError);
        try {
            return await makeRequest(FALLBACK_MODEL);
        } catch (fallbackError) {
            console.error('All OpenRouter models failed:', fallbackError);
            throw fallbackError;
        }
    }
}

/**
 * Generate AI response (non-streaming)
 */
export async function generateSpatulaAIResponse(userPrompt: string): Promise<string> {
    try {
        const data = await fetchOpenRouterCompletion([
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userPrompt }
        ]);
        const content = data.choices?.[0]?.message?.content;
        return typeof content === 'string' ? content : 'I apologize, but I could not generate a response.';
    } catch (error) {
        console.error('OpenRouter API Error:', error);
        throw new Error('Failed to connect to AI service. Please try again.');
    }
}

/**
 * Stream AI response (real-time word-by-word)
 */
export async function streamSpatulaAIResponse(
    userPrompt: string,
    onChunk: (text: string) => void
): Promise<void> {
    const headers = {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://cityoftruth.com',
        'X-Title': 'City of Truth Ministries AI',
    };

    const makeStreamRequest = async (model: string) => {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ],
                stream: true,
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('Failed to get stream reader');
        }

        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                const cleanedLine = line.trim();
                if (!cleanedLine) continue;
                if (cleanedLine === 'data: [DONE]') continue;

                if (cleanedLine.startsWith('data:')) {
                    try {
                        const parsed = JSON.parse(cleanedLine.slice(5).trim());
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                            onChunk(content);
                        }
                    } catch (e) {
                        // Ignore parse errors on incomplete lines
                    }
                }
            }
        }
    };

    const activeModel = getSelectedModel();
    try {
        await makeStreamRequest(activeModel);
    } catch (primaryError) {
        console.warn(`Primary model streaming failed, trying fallback ${FALLBACK_MODEL}:`, primaryError);
        try {
            await makeStreamRequest(FALLBACK_MODEL);
        } catch (fallbackError) {
            console.error('All OpenRouter streaming models failed:', fallbackError);
            throw fallbackError;
        }
    }
}

/**
 * Analyze an image and return a text description / extracted text
 */
export async function analyzeImageWithAI(
    base64Image: string,
    mimeType: string = 'image/jpeg'
): Promise<string> {
    try {
        const data = await fetchOpenRouterCompletion([
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
        ]);
        const content = data.choices?.[0]?.message?.content;
        if (typeof content === 'string') return content;
        if (Array.isArray(content)) {
            return content.map((p: any) => (typeof p === 'string' ? p : p.text ?? '')).join('');
        }
        return 'Unable to analyze the image. Please try again.';
    } catch (error) {
        console.error('Image Analysis Error:', error);
        throw new Error('Failed to analyze the image. Please try again.');
    }
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
        const data = await fetchOpenRouterCompletion([
            { role: 'system', content: 'You are an expert in Biblical Hebrew and Tamil translations. Respond only with valid JSON.' },
            { role: 'user', content: prompt }
        ], true);
        const content = data.choices?.[0]?.message?.content;
        return JSON.parse(typeof content === 'string' ? content : JSON.stringify(content));
    } catch (error) {
        console.error('Hebrew Analysis Error:', error);
        throw new Error('Failed to analyze word. Please check your AI configuration.');
    }
}

/**
 * Fetch credits, limits, and usage data for the current active OpenRouter API Key
 */
export async function getOpenRouterKeyDetails(): Promise<any> {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch key details: ${response.statusText}`);
        }
        const res = await response.json();
        return res?.data || null;
    } catch (error) {
        console.error('Error fetching key details:', error);
        return null;
    }
}

/**
 * Fetch metadata for default and fallback models
 */
export async function getOpenRouterModelDetails(): Promise<any> {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch model details: ${response.statusText}`);
        }
        const data = await response.json();
        const activeModelId = getSelectedModel();
        const defaultModelInfo = data.data?.find((m: any) => m.id === activeModelId);
        const fallbackModelInfo = data.data?.find((m: any) => m.id === FALLBACK_MODEL);
        return {
            defaultModel: defaultModelInfo || { id: activeModelId, name: activeModelId, context_length: 8192 },
            fallbackModel: fallbackModelInfo || { id: FALLBACK_MODEL, name: 'OpenRouter Free Auto-Router', context_length: 4096 },
            allModels: data.data || []
        };
    } catch (error) {
        console.error('Error fetching model details:', error);
        const activeModelId = getSelectedModel();
        return {
            defaultModel: { id: activeModelId, name: activeModelId, context_length: 8192 },
            fallbackModel: { id: FALLBACK_MODEL, name: 'OpenRouter Free Auto-Router', context_length: 4096 },
            allModels: []
        };
    }
}
