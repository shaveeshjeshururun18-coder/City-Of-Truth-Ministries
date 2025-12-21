import { createGoogleGenAI } from "@google/genai";

export const getSpiritualEncouragement = async (topic: string): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("Gemini API Key missing. Please add VITE_GEMINI_API_KEY to your .env file.");
      return "The Lord is my shepherd; I shall not want. (Psalm 23:1)";
    }

    const ai = createGoogleGenAI({ apiKey });

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