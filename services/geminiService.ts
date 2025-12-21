import { GoogleGenAI } from "@google/genai";

export const getSpiritualEncouragement = async (topic: string): Promise<string> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("Gemini API Key missing. Please add VITE_GEMINI_API_KEY to your .env file.");
      return "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. (Psalm 23:1-2)";
    }

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: `Provide a short, encouraging spiritual word and a relevant Bible verse (with citation) for someone struggling with or seeking guidance on: ${topic}. Speak as a warm, supportive ministry leader from City of Truth Ministries.`,
      config: {
        systemInstruction: "You are a warm, encouraging spiritual leader. Your goal is to provide comfort and biblical truth. Keep responses concise (under 100 words), focused on hope, and always include one specific scripture reference.",
        temperature: 0.7,
        topP: 0.9,
      },
    });

    return response.text || "May God's grace and peace be multiplied to you today. Stay strong in the Lord.";
  } catch (error) {
    console.error("Error fetching spiritual encouragement:", error);
    return "God is our refuge and strength, an ever-present help in trouble. (Psalm 46:1)";
  }
};