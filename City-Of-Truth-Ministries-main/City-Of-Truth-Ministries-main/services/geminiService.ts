import { GoogleGenAI } from "@google/genai";

const WEBSITE_CONTEXT = `
You are the AI Assistant for City of Truth Ministries (COT Ministries), a Tamil Christian ministry dedicated to worship, Hebrew studies, and spiritual growth.
Your name is "Divine Assistant". You are warm, encouraging, and knowledgeable.

Website Pages & Information:
1. **Home**: Main landing page. Features "Divine Assistant" (AI), "Golden Menorah Temple", and ministry highlights.
2. **Ministries**:
   - **Worship**: Information about worship services (Tamil & English).
   - **Hebrew Studies**: "Baruch Hashem" program for learning biblical Hebrew.
   - **Menorah**: "Golden Menorah Temple" page displaying the sacred standard/flag.
3. **Valparai**: Information about the "City of Truth" project in Valparai (Hill station). A place of prayer and retreat.
4. **AI Assistance**: The "Divine Assistant" page (where the user can clear sessions, etc.).
5. **Entrust Card**: A page for the "Worshipper ID Card" or "Entrust Card".
6. **Hebrew**: Specific resources for Hebrew learning.
7. **Contact**: Contact form and details.

Key Mission: "To bring the light of Truth to every seeker of grace."
Pastor/Leader: (If known, otherwise generic).

If asked about navigation (e.g., "Go to Menorah page"), you can guide them to the menu.
If asked about specific topics (e.g., "What is the Menorah?"), use the context above to answer accurately.
Always be concise (under 3 sentences unless asked for more details).
`;

export const getSpiritualEncouragement = async (topic: string): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("Gemini API Key missing. Please add VITE_GEMINI_API_KEY to your .env file.");
      return "The Lord is my shepherd; I shall not want. (Psalm 23:1)";
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `Provide a short, encouraging spiritual word and a relevant Bible verse (with citation) for someone struggling with or seeking guidance on: ${topic}. Speak as a warm, supportive ministry leader from City of Truth Ministries. Keep it concise (under 80 words) and focused on hope.` }]
        }
      ]
    });

    return response.text || "May God's grace and peace be multiplied to you today.";
  } catch (error) {
    console.error("Error fetching spiritual encouragement:", error);
    return "God is our refuge and strength, an ever-present help in trouble. (Psalm 46:1)";
  }
};

export const getWebsiteAssistantResponse = async (userMessage: string, chatHistory: { role: string, content: string }[] = []): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return "I'm currently offline (API Key missing). But I can tell you that God loves you!";
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format history for Gemini
    const historyParts = chatHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: WEBSITE_CONTEXT + "\n\nUser Question: " + userMessage }]
        }
      ],
      // Note: For a real chat app, you'd pass 'historyParts' to startChat, but for this simple widget, single-turn with context is often sufficient or we can append history to the prompt.
    });

    return response.text || "I'm here to help you navigate our spiritual sanctuary. How can I assist?";
  } catch (error) {
    console.error("Error in AI Assistant:", error);
    return "I'm having trouble connecting to the spiritual network right now. Please try again later.";
  }
};