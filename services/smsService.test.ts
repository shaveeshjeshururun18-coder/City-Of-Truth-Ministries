import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { sendSMS } from './smsService';

describe('SMS Service', () => {
  let fetchSpy: any;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.restoreAllMocks();
    vi.unstubAllEnvs();

    // Globally mock fetch to avoid any actual network requests
    fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ sid: 'DEFAULT_MOCK_SID' })
      } as any);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('When SMS is disabled (VITE_ENABLE_SMS is not true)', () => {
    it('should return a mock success response without calling fetch', async () => {
      vi.stubEnv('VITE_ENABLE_SMS', 'false');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const result = await sendSMS('+1234567890', 'Hello from test!');

      expect(result.success).toBe(true);
      expect(result.messageId).toMatch(/^MOCK-SMS-\d{6}$/);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('SMS service (VITE_ENABLE_SMS) is disabled'),
        expect.any(Object)
      );
    });
  });

  describe('When SMS is enabled but credentials are missing', () => {
    it('should return failure if VITE_TWILIO_ACCOUNT_SID is missing', async () => {
      vi.stubEnv('VITE_ENABLE_SMS', 'true');
      vi.stubEnv('VITE_TWILIO_ACCOUNT_SID', '');
      vi.stubEnv('VITE_TWILIO_AUTH_TOKEN', 'token123');
      vi.stubEnv('VITE_TWILIO_PHONE_NUMBER', '+1987654321');

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await sendSMS('+1234567890', 'Hello from test!');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing Twilio configuration (Account SID, Auth Token, or Phone Number).');
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return failure if VITE_TWILIO_AUTH_TOKEN is missing', async () => {
      vi.stubEnv('VITE_ENABLE_SMS', 'true');
      vi.stubEnv('VITE_TWILIO_ACCOUNT_SID', 'sid123');
      vi.stubEnv('VITE_TWILIO_AUTH_TOKEN', '');
      vi.stubEnv('VITE_TWILIO_PHONE_NUMBER', '+1987654321');

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await sendSMS('+1234567890', 'Hello from test!');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing Twilio configuration (Account SID, Auth Token, or Phone Number).');
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should return failure if VITE_TWILIO_PHONE_NUMBER is missing', async () => {
      vi.stubEnv('VITE_ENABLE_SMS', 'true');
      vi.stubEnv('VITE_TWILIO_ACCOUNT_SID', 'sid123');
      vi.stubEnv('VITE_TWILIO_AUTH_TOKEN', 'token123');
      vi.stubEnv('VITE_TWILIO_PHONE_NUMBER', '');

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await sendSMS('+1234567890', 'Hello from test!');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Missing Twilio configuration (Account SID, Auth Token, or Phone Number).');
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('When SMS is enabled and fully configured', () => {
    beforeEach(() => {
      vi.stubEnv('VITE_ENABLE_SMS', 'true');
      vi.stubEnv('VITE_TWILIO_ACCOUNT_SID', 'ACxxxxx');
      vi.stubEnv('VITE_TWILIO_AUTH_TOKEN', 'authxxxxx');
      vi.stubEnv('VITE_TWILIO_PHONE_NUMBER', '+12015550123');
    });

    it('should format recipient phone number to E.164 if already formatted (keeps + prefix)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ sid: 'SMabc123' })
      });
      global.fetch = mockFetch;

      const result = await sendSMS(' +12345678901 ', 'Body content');

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('SMabc123');

      // Check fetch arguments
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe('https://api.twilio.com/2010-04-01/Accounts/ACxxxxx/Messages.json');
      expect(options.method).toBe('POST');
      expect(options.headers['Authorization']).toBe(`Basic ${btoa('ACxxxxx:authxxxxx')}`);
      expect(options.headers['Content-Type']).toBe('application/x-www-form-urlencoded');

      const bodyParams = new URLSearchParams(options.body);
      expect(bodyParams.get('To')).toBe('+12345678901');
      expect(bodyParams.get('From')).toBe('+12015550123');
      expect(bodyParams.get('Body')).toBe('Body content');
    });

    it('should format 10-digit number by prepending +91 default country code', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ sid: 'SMabc123' })
      });
      global.fetch = mockFetch;

      const result = await sendSMS('9876543210', 'Body content');

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('SMabc123');

      const [, options] = mockFetch.mock.calls[0];
      const bodyParams = new URLSearchParams(options.body);
      expect(bodyParams.get('To')).toBe('+919876543210');
    });

    it('should handle other digit count (strip non-digits, prepend +)', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ sid: 'SMabc123' })
      });
      global.fetch = mockFetch;

      const result = await sendSMS('1-(555)-123-45678', 'Body content');

      expect(result.success).toBe(true);
      expect(result.messageId).toBe('SMabc123');

      const [, options] = mockFetch.mock.calls[0];
      const bodyParams = new URLSearchParams(options.body);
      expect(bodyParams.get('To')).toBe('+155512345678');
    });

    it('should return failure if Twilio API returns an error response with message', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Twilio internal validation failed' })
      });
      global.fetch = mockFetch;

      const result = await sendSMS('+12345678901', 'Body content');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Twilio internal validation failed');
      expect(result.messageId).toBeUndefined();
    });

    it('should return default failure message if Twilio API returns error without details', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({})
      });
      global.fetch = mockFetch;

      const result = await sendSMS('+12345678901', 'Body content');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Twilio API response error');
    });

    it('should return success is false and handle fetch/network exceptions gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockFetch = vi.fn().mockRejectedValue(new Error('DNS resolution failed'));
      global.fetch = mockFetch;

      const result = await sendSMS('+12345678901', 'Body content');

      expect(result.success).toBe(false);
      expect(result.error).toBe('DNS resolution failed');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
