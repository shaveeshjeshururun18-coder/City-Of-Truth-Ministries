import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getSelectedModel,
  setSelectedOpenRouterModel,
  getSelectedFallbackModel,
  setSelectedFallbackModel,
  generateSpatulaAIResponse,
  streamSpatulaAIResponse,
  analyzeImageWithAI,
  analyzeHebrewWord,
  getOpenRouterKeyDetails,
  getOpenRouterModelDetails
} from './openRouterService';

const DEFAULT_MODEL = 'google/gemini-2.0-flash-lite-preview-02-05:free';
const DEFAULT_FALLBACK_MODEL = 'openrouter/auto';

describe('openRouterService - LocalStorage Config Functions', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    });
    vi.stubGlobal('window', {
      localStorage: globalThis.localStorage
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('getSelectedModel', () => {
    it('should return DEFAULT_MODEL if localStorage does not have a value', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      expect(getSelectedModel()).toBe(DEFAULT_MODEL);
    });

    it('should return the saved value from localStorage if available', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('custom-model');
      expect(getSelectedModel()).toBe('custom-model');
    });

    it('should return DEFAULT_MODEL if localStorage throws an error', () => {
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error('Access Denied');
      });
      expect(getSelectedModel()).toBe(DEFAULT_MODEL);
    });
  });

  describe('setSelectedOpenRouterModel', () => {
    it('should save the modelId to localStorage', () => {
      setSelectedOpenRouterModel('new-model');
      expect(localStorage.setItem).toHaveBeenCalledWith('cot_selected_openrouter_model', 'new-model');
    });

    it('should catch errors and not crash when localStorage throws', () => {
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error('Quota exceeded');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => setSelectedOpenRouterModel('new-model')).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('getSelectedFallbackModel', () => {
    it('should return DEFAULT_FALLBACK_MODEL if localStorage does not have a value', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null);
      expect(getSelectedFallbackModel()).toBe(DEFAULT_FALLBACK_MODEL);
    });

    it('should return the saved fallback value from localStorage if available', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('custom-fallback');
      expect(getSelectedFallbackModel()).toBe('custom-fallback');
    });

    it('should return DEFAULT_FALLBACK_MODEL if localStorage throws an error', () => {
      vi.mocked(localStorage.getItem).mockImplementation(() => {
        throw new Error('Access Denied');
      });
      expect(getSelectedFallbackModel()).toBe(DEFAULT_FALLBACK_MODEL);
    });
  });

  describe('setSelectedFallbackModel', () => {
    it('should save the fallback modelId to localStorage', () => {
      setSelectedFallbackModel('new-fallback');
      expect(localStorage.setItem).toHaveBeenCalledWith('cot_selected_fallback_model', 'new-fallback');
    });

    it('should catch errors and not crash when localStorage throws', () => {
      vi.mocked(localStorage.setItem).mockImplementation(() => {
        throw new Error('Quota exceeded');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => setSelectedFallbackModel('new-fallback')).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});

describe('openRouterService - API Call Functions', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('localStorage', {
      getItem: vi.fn().mockImplementation((key) => {
        if (key === 'cot_selected_openrouter_model') return DEFAULT_MODEL;
        if (key === 'cot_selected_fallback_model') return DEFAULT_FALLBACK_MODEL;
        return null;
      }),
      setItem: vi.fn(),
    });
    vi.stubGlobal('window', {
      localStorage: globalThis.localStorage
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('generateSpatulaAIResponse', () => {
    it('should generate content successfully using openrouter API', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '🏺 Message Title\n\n📖 Scripture\n\n━━━━━━━━━━━━\n\n🙏 Response Body'
            }
          }
        ]
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any);

      const response = await generateSpatulaAIResponse('test prompt');
      expect(response).toContain('🏺 Message Title');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should try fallback model if the primary model fails', async () => {
      // First call (primary) fails
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      } as any);

      // Second call (fallback) succeeds
      const mockResponse = {
        choices: [{ message: { content: 'Fallback Success Content' } }]
      };
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any);

      const response = await generateSpatulaAIResponse('test prompt');
      expect(response).toBe('Fallback Success Content');
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should return a locally simulated fallback response if all API calls fail', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const response = await generateSpatulaAIResponse('how to register');
      expect(response).toContain('Registration & Membership');
      expect(response).toContain('[TOUR:register]');
    });
  });

  describe('streamSpatulaAIResponse', () => {
    it('should stream chunks correctly', async () => {
      const onChunk = vi.fn();
      const mockReadableStream = {
        getReader: () => {
          let callCount = 0;
          return {
            read: async () => {
              if (callCount === 0) {
                callCount++;
                const encoder = new TextEncoder();
                const chunkStr = 'data: {"choices": [{"delta": {"content": "Hello "}}]}\ndata: {"choices": [{"delta": {"content": "World!"}}]}\n';
                return { done: false, value: encoder.encode(chunkStr) };
              }
              return { done: true, value: undefined };
            }
          };
        }
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        body: mockReadableStream
      } as any);

      await streamSpatulaAIResponse('hello prompt', onChunk);
      expect(onChunk).toHaveBeenCalledWith('Hello ');
      expect(onChunk).toHaveBeenCalledWith('World!');
    });

    it('should simulate word-by-word fallback stream when network/API call fails', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network offline'));
      const onChunk = vi.fn();

      await streamSpatulaAIResponse('how to login', onChunk);
      expect(onChunk).toHaveBeenCalled();
      // Ensure the text of the fallback contains appropriate markers
      const calls = onChunk.mock.calls.map(args => args[0]).join('');
      expect(calls).toContain('Login');
      expect(calls).toContain('[TOUR:login]');
    });
  });

  describe('analyzeImageWithAI', () => {
    it('should post base64 image data to OpenRouter and return analyzed description', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'This is an image description.'
            }
          }
        ]
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any);

      const response = await analyzeImageWithAI('base64String', 'image/png');
      expect(response).toBe('This is an image description.');
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should throw an error if the analysis API fails', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Image parsing failed'));

      await expect(analyzeImageWithAI('base64String')).rejects.toThrow('Failed to analyze the image');
    });
  });

  describe('analyzeHebrewWord', () => {
    it('should return parsed structured JSON for a Hebrew word', async () => {
      const mockStructured = {
        pronunciation: 'Shalom',
        meaningEn: 'Peace'
      };
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify(mockStructured)
            }
          }
        ]
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as any);

      const response = await analyzeHebrewWord('שלום');
      expect(response.pronunciation).toBe('Shalom');
      expect(response.meaningEn).toBe('Peace');
    });

    it('should throw error if the API call throws', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('JSON parse error'));

      await expect(analyzeHebrewWord('שלום')).rejects.toThrow('Failed to analyze word');
    });
  });

  describe('getOpenRouterKeyDetails', () => {
    it('should call get details and return key info', async () => {
      const mockData = {
        data: {
          limit: 100,
          usage: 10
        }
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      } as any);

      const details = await getOpenRouterKeyDetails();
      expect(details.limit).toBe(100);
      expect(details.usage).toBe(10);
    });

    it('should return null if call returns non-ok status', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Forbidden'
      } as any);

      const details = await getOpenRouterKeyDetails();
      expect(details).toBeNull();
    });
  });

  describe('getOpenRouterModelDetails', () => {
    it('should retrieve model lists and map active/fallback details', async () => {
      const mockModelsData = {
        data: [
          { id: DEFAULT_MODEL, name: 'Active Gemini', context_length: 8192 },
          { id: DEFAULT_FALLBACK_MODEL, name: 'Fallback Auto', context_length: 4096 }
        ]
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockModelsData
      } as any);

      const details = await getOpenRouterModelDetails();
      expect(details.defaultModel.name).toBe('Active Gemini');
      expect(details.fallbackModel.name).toBe('Fallback Auto');
      expect(details.allModels).toHaveLength(2);
    });

    it('should return default stub data if models retrieval fails', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const details = await getOpenRouterModelDetails();
      expect(details.defaultModel.id).toBe(DEFAULT_MODEL);
      expect(details.fallbackModel.id).toBe(DEFAULT_FALLBACK_MODEL);
      expect(details.allModels).toEqual([]);
    });
  });
});
