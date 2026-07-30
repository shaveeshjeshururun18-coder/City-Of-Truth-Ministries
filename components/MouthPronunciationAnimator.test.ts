import { describe, it, expect } from 'vitest';
import {
  HEBREW_LETTER_PHONEMES,
  PHONEME_TARGETS,
  PHONEME_VISEME_FILES
} from './MouthPronunciationAnimator';

describe('Mouth Pronunciation Constants validation', () => {
  it('should have PHONEME_TARGETS and PHONEME_VISEME_FILES keys match perfectly', () => {
    const targetsKeys = Object.keys(PHONEME_TARGETS).sort();
    const visemeKeys = Object.keys(PHONEME_VISEME_FILES).sort();

    expect(targetsKeys).toEqual(visemeKeys);
  });

  it('should verify every phoneme referenced in HEBREW_LETTER_PHONEMES exists in PHONEME_TARGETS and PHONEME_VISEME_FILES', () => {
    Object.entries(HEBREW_LETTER_PHONEMES).forEach(([letter, sequence]) => {
      expect(Array.isArray(sequence)).toBe(true);
      expect(sequence.length).toBeGreaterThan(0);

      sequence.forEach((step, idx) => {
        // Assert phoneme exists
        expect(PHONEME_TARGETS).toHaveProperty(step.phoneme);
        expect(PHONEME_VISEME_FILES).toHaveProperty(step.phoneme);

        // Assert duration is a valid positive number
        expect(typeof step.duration).toBe('number');
        expect(step.duration).toBeGreaterThan(0);

        // Assert syllable is a non-empty string
        expect(typeof step.syllable).toBe('string');
        expect(step.syllable.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('should verify REST viseme is defined', () => {
    expect(PHONEME_TARGETS).toHaveProperty('REST');
    expect(PHONEME_VISEME_FILES).toHaveProperty('REST');
  });
});
