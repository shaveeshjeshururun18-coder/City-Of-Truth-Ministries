import { describe, it, expect } from 'vitest';
import { normalizePagePath } from './routePaths';

describe('normalizePagePath', () => {
  describe('empty and whitespace inputs', () => {
    it('should return an empty string for empty input', () => {
      expect(normalizePagePath('')).toBe('');
    });

    it('should return an empty string for whitespace-only input', () => {
      expect(normalizePagePath('   ')).toBe('');
    });
  });

  describe('absolute URLs', () => {
    it('should extract path, query, and hash from a full HTTPS URL', () => {
      expect(normalizePagePath('https://example.com/hebrew-tools?param=val#section'))
        .toBe('/hebrew-tools?param=val#section');
    });

    it('should extract path and query from a full HTTP URL', () => {
      expect(normalizePagePath('http://example.com/path?query=1'))
        .toBe('/path?query=1');
    });

    it('should extract path and hash from a full URL', () => {
      expect(normalizePagePath('https://example.com/hebrew-clock#now'))
        .toBe('/hebrew-clock#now');
    });

    it('should return "/" for domain-only URLs', () => {
      expect(normalizePagePath('https://example.com')).toBe('/');
      expect(normalizePagePath('https://example.com/')).toBe('/');
    });

    it('should handle non-HTTP absolute URLs if they parse correctly', () => {
      expect(normalizePagePath('ftp://example.com/file')).toBe('/file');
    });
  });

  describe('relative paths', () => {
    it('should prepend a slash if it is missing', () => {
      expect(normalizePagePath('about')).toBe('/about');
      expect(normalizePagePath('hebrew-calendar')).toBe('/hebrew-calendar');
    });

    it('should preserve the path if it already starts with a slash', () => {
      expect(normalizePagePath('/about')).toBe('/about');
      expect(normalizePagePath('/hebrew-calendar')).toBe('/hebrew-calendar');
    });
  });

  describe('duplicate slashes handling', () => {
    it('should replace multiple slashes with a single slash', () => {
      expect(normalizePagePath('///about')).toBe('/about');
      expect(normalizePagePath('about///us')).toBe('/about/us');
      expect(normalizePagePath('/about//us///contact')).toBe('/about/us/contact');
      expect(normalizePagePath('///')).toBe('/');
    });
  });

  describe('whitespace trimming', () => {
    it('should trim whitespace around absolute URLs', () => {
      expect(normalizePagePath('  https://example.com/about  ')).toBe('/about');
    });

    it('should trim whitespace around relative paths', () => {
      expect(normalizePagePath('   about   ')).toBe('/about');
      expect(normalizePagePath('  /about/us  ')).toBe('/about/us');
    });
  });
});
