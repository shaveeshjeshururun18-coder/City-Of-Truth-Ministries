import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendFCMNotification } from './fcmService';

describe('FCM Notification Service - sendFCMNotification', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return success and results immediately when no device tokens are provided', async () => {
    const result = await sendFCMNotification([], 'Title', 'Body');
    expect(result).toEqual({
      success: true,
      results: [],
      error: 'No target device tokens provided.'
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should filter out blank or non-string device tokens and return immediate success if none remain', async () => {
    const result = await sendFCMNotification([' ', '', null as any, undefined as any], 'Title', 'Body');
    expect(result).toEqual({
      success: true,
      results: [],
      error: 'No target device tokens provided.'
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('should successfully send notification when fetch returns standard successful response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, successCount: 2 })
    });

    const result = await sendFCMNotification(['token1', 'token2'], 'Test Title', 'Test Body', 'http://example.com/image.png');

    expect(mockFetch).toHaveBeenCalledWith('/api/sendPush', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tokens: ['token1', 'token2'],
        title: 'Test Title',
        body: 'Test Body',
        imageUrl: 'http://example.com/image.png'
      })
    });

    expect(result).toEqual({
      success: true,
      results: [{ status: 'Sent via Vercel Function', successCount: 2 }]
    });
  });

  it('should handle failed FCM delivery response when fetch ok but success is false', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false, error: 'Invalid tokens supplied' })
    });

    const result = await sendFCMNotification(['token1'], 'Title', 'Body');

    expect(result).toEqual({
      success: false,
      error: 'Invalid tokens supplied'
    });
  });

  it('should handle failed FCM delivery response when fetch ok but success is false and no error message is provided', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: false })
    });

    const result = await sendFCMNotification(['token1'], 'Title', 'Body');

    expect(result).toEqual({
      success: false,
      error: 'Vercel function returned failure'
    });
  });

  it('should handle non-ok HTTP responses from the sendPush API endpoint', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ success: false, error: 'Rate limit exceeded' })
    });

    const result = await sendFCMNotification(['token1'], 'Title', 'Body');

    expect(result).toEqual({
      success: false,
      error: 'Rate limit exceeded'
    });
  });

  it('should handle fetch request exceptions gracefully', async () => {
    const errorMsg = 'Failed to fetch';
    mockFetch.mockRejectedValueOnce(new Error(errorMsg));

    const result = await sendFCMNotification(['token1'], 'Title', 'Body');

    expect(result).toEqual({
      success: false,
      error: errorMsg
    });
  });

  it('should fallback to default error message if fetch rejected without a message', async () => {
    mockFetch.mockRejectedValueOnce({});

    const result = await sendFCMNotification(['token1'], 'Title', 'Body');

    expect(result).toEqual({
      success: false,
      error: 'Vercel Function request failed'
    });
  });
});
