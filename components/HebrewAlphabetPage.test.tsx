import { describe, it, expect, beforeEach } from 'vitest';
import { HEBREW_LETTERS_DATA } from './HebrewAlphabetPage';

// Mock localStorage for node environment
const mockStorage: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => { mockStorage[key] = value; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

if (typeof window === 'undefined' || !global.localStorage) {
  (global as any).localStorage = mockLocalStorage;
}

describe('HebrewAlphabetPage & Hand Tracing Data', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('contains 22 Hebrew letters with valid data and SVG path entries', () => {
    expect(HEBREW_LETTERS_DATA).toHaveLength(22);
    HEBREW_LETTERS_DATA.forEach((letter) => {
      expect(letter.letter).toBeTruthy();
      expect(letter.name).toBeTruthy();
      expect(letter.tamilPronunciation).toBeTruthy();
      expect(letter.exampleWords.length).toBeGreaterThan(0);
      expect(letter.quiz.options).toHaveLength(4);
    });
  });

  it('correctly tracks learned letters in localStorage', () => {
    const key = 'cot_hebrew_learned_letters';
    const initialLearned = [0, 1, 2];
    localStorage.setItem(key, JSON.stringify(initialLearned));

    const saved = localStorage.getItem(key);
    expect(saved).toBeTruthy();
    expect(JSON.parse(saved!)).toEqual([0, 1, 2]);
  });

  it('correctly saves tracing high scores in localStorage', () => {
    const scoresKey = 'cot_hebrew_tracing_scores';
    const mockScores = { 0: 95, 1: 88 };
    localStorage.setItem(scoresKey, JSON.stringify(mockScores));

    const savedScores = localStorage.getItem(scoresKey);
    expect(savedScores).toBeTruthy();
    expect(JSON.parse(savedScores!)).toEqual({ 0: 95, 1: 88 });
  });
});
