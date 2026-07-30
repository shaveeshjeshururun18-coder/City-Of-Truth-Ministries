import { describe, it, expect, vi } from 'vitest';
import { formatDuration, formatExactTime } from './analyticsService';

// Mock Firebase
vi.mock('./firebase', () => ({
  db: {}
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(() => ({ _seconds: Date.now() / 1000 })),
  Timestamp: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn()
}));

describe('Analytics Utility Functions', () => {
  describe('formatDuration', () => {
    it('should format seconds below 60 correctly', () => {
      expect(formatDuration(0)).toBe('0s');
      expect(formatDuration(1)).toBe('1s');
      expect(formatDuration(45)).toBe('45s');
      expect(formatDuration(59)).toBe('59s');
    });

    it('should format minutes and seconds correctly when duration is between 1 minute and 1 hour', () => {
      expect(formatDuration(60)).toBe('1m 0s');
      expect(formatDuration(61)).toBe('1m 1s');
      expect(formatDuration(119)).toBe('1m 59s');
      expect(formatDuration(120)).toBe('2m 0s');
      expect(formatDuration(3599)).toBe('59m 59s');
    });

    it('should format hours and minutes correctly when duration is 1 hour or more', () => {
      expect(formatDuration(3600)).toBe('1h 0m');
      expect(formatDuration(3659)).toBe('1h 0m'); // 3659s is 1h 0m 59s. Since it discards seconds, it's 1h 0m
      expect(formatDuration(3660)).toBe('1h 1m');
      expect(formatDuration(7200)).toBe('2h 0m');
      expect(formatDuration(86400)).toBe('24h 0m'); // 24 hours
      expect(formatDuration(90060)).toBe('25h 1m'); // 25 hours, 1 minute
    });

    it('should handle fractional seconds (decimals) correctly', () => {
      expect(formatDuration(0.5)).toBe('0.5s');
      expect(formatDuration(59.9)).toBe('59.9s');
      // 60.5 seconds:
      // m = Math.floor(60.5 / 60) = 1
      // s = 60.5 % 60 = 0.5
      expect(formatDuration(60.5)).toBe('1m 0.5s');
    });

    it('should handle negative and edge values cleanly', () => {
      expect(formatDuration(-10)).toBe('-10s');
      expect(formatDuration(-120)).toBe('-120s'); // Less than 60 condition checks value < 60, so -120 returns "-120s"
    });
  });

  describe('formatExactTime', () => {
    it('should correctly format a valid ISO date-time string to en-IN format', () => {
      const isoString = '2023-01-01T12:00:00.000Z';
      const result = formatExactTime(isoString);

      // Since toLocaleTimeString depends on runtime/timezone environment, we should make sure the format matches:
      // HH:MM:SS am/pm (or AM/PM or similar format with 2-digit hour, minute, second)
      expect(result).toMatch(/^(0[1-9]|1[0-2]):[0-5][0-9]:[0-5][0-9]\s*(am|pm|AM|PM)$/i);
    });

    it('should return "Invalid Date" (or standard runtime representation) for standard invalid date string', () => {
      const invalidInput = 'not-a-date';
      const result = formatExactTime(invalidInput);

      // Standard JS environment toLocaleTimeString on invalid date returns "Invalid Date"
      expect(result).toBe('Invalid Date');
    });

    it('should return the fallback string when toLocaleTimeString throws an exception', () => {
      // Mock toLocaleTimeString to throw an error to cover the catch block
      const spy = vi.spyOn(Date.prototype, 'toLocaleTimeString').mockImplementation(() => {
        throw new Error('Locale formatting failed');
      });

      const input = '2023-01-01T12:00:00.000Z';
      const result = formatExactTime(input);

      // Verify it catches the exception and returns the fallback string (original input)
      expect(result).toBe(input);

      // Restore original implementation
      spy.mockRestore();
    });
  });
});
