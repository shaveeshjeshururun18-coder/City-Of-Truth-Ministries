import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Declare mock functions with 'mock' prefix so they are hoisted and accessible inside vi.mock
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: class {
      models = {
        generateContent: mockGenerateContent
      };
    }
  };
});

import { getSpiritualEncouragement, getWebsiteAssistantResponse } from './geminiService';

describe('Gemini Service Tests', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('getSpiritualEncouragement', () => {
    it('returns fallback Psalm 23:1 when VITE_GEMINI_API_KEY is missing', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const result = await getSpiritualEncouragement('peace');
      expect(result).toBe('The Lord is my shepherd; I shall not want. (Psalm 23:1)');
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('returns spiritual encouragement from Gemini API when API key is present', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'fake-api-key');
      mockGenerateContent.mockResolvedValue({
        text: 'He restores my soul. (Psalm 23:3)'
      });

      const result = await getSpiritualEncouragement('peace');
      expect(result).toBe('He restores my soul. (Psalm 23:3)');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('returns default encouragement message when response has empty or falsy text', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'fake-api-key');
      mockGenerateContent.mockResolvedValue({
        text: ''
      });

      const result = await getSpiritualEncouragement('peace');
      expect(result).toBe("May God's grace and peace be multiplied to you today.");
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('returns fallback Psalm 46:1 when GoogleGenAI API throws an error', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'fake-api-key');
      mockGenerateContent.mockRejectedValue(new Error('API limit reached'));

      // Suppress console.error output during the test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getSpiritualEncouragement('peace');
      expect(result).toBe('God is our refuge and strength, an ever-present help in trouble. (Psalm 46:1)');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('getWebsiteAssistantResponse', () => {
    it('returns missing API Key fallback message when VITE_GEMINI_API_KEY is missing', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', '');

      const result = await getWebsiteAssistantResponse('Hello');
      expect(result).toBe("I'm currently offline (API Key missing). But I can tell you that God loves you!");
      expect(mockGenerateContent).not.toHaveBeenCalled();
    });

    it('returns chatbot response from Gemini API when API key is present', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'fake-api-key');
      mockGenerateContent.mockResolvedValue({
        text: 'Welcome to City of Truth Ministries!'
      });

      const result = await getWebsiteAssistantResponse('Hello');
      expect(result).toBe('Welcome to City of Truth Ministries!');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('returns default chatbot response when response text is empty or missing', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'fake-api-key');
      mockGenerateContent.mockResolvedValue({
        text: ''
      });

      const result = await getWebsiteAssistantResponse('Hello');
      expect(result).toBe("I'm here to help you navigate our spiritual sanctuary. How can I assist?");
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('returns offline error fallback message when API throws an error', async () => {
      vi.stubEnv('VITE_GEMINI_API_KEY', 'fake-api-key');
      mockGenerateContent.mockRejectedValue(new Error('Network disconnected'));

      // Suppress console.error output during the test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getWebsiteAssistantResponse('Hello');
      expect(result).toBe("I'm having trouble connecting to the spiritual network right now. Please try again later.");
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
