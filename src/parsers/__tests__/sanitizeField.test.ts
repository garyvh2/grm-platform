import { describe, it, expect } from 'vitest';
import { sanitizeField } from '../sanitizeField';

describe('sanitizeField', () => {
  // ── 1. Basic behavior ──────────────────────────────────────────────
  describe('basic behavior', () => {
    it('returns a trimmed string', () => {
      expect(sanitizeField('  hello  ')).toBe('hello');
    });

    it('returns empty string for empty input', () => {
      expect(sanitizeField('')).toBe('');
    });

    it('returns empty string for whitespace-only input', () => {
      expect(sanitizeField('   \t  ')).toBe('');
    });
  });

  // ── 2. Zero-width characters ───────────────────────────────────────
  describe('zero-width characters', () => {
    it('strips ZWSP (\\u200B) from start, middle, and end', () => {
      expect(sanitizeField('\u200Bhello\u200Bworld\u200B')).toBe('helloworld');
    });

    it('strips ZWNJ (\\u200C)', () => {
      expect(sanitizeField('hel\u200Clo')).toBe('hello');
    });

    it('strips ZWJ (\\u200D)', () => {
      expect(sanitizeField('\u200Dtext\u200D')).toBe('text');
    });
  });

  // ── 3. BOM / FEFF ─────────────────────────────────────────────────
  describe('BOM / FEFF', () => {
    it('strips \\uFEFF from field content', () => {
      expect(sanitizeField('\uFEFFArtist Name')).toBe('Artist Name');
    });

    it('strips \\uFEFF embedded in the middle', () => {
      expect(sanitizeField('Art\uFEFFist')).toBe('Artist');
    });
  });

  // ── 4. Directional marks ───────────────────────────────────────────
  describe('directional marks', () => {
    it('strips LRM (\\u200E)', () => {
      expect(sanitizeField('\u200EHello\u200E')).toBe('Hello');
    });

    it('strips RLM (\\u200F)', () => {
      expect(sanitizeField('Hel\u200Flo')).toBe('Hello');
    });
  });

  // ── 5. Format characters ───────────────────────────────────────────
  describe('format characters', () => {
    it('strips word joiner (\\u2060)', () => {
      expect(sanitizeField('word\u2060joiner')).toBe('wordjoiner');
    });

    it('strips \\u206F', () => {
      expect(sanitizeField('\u206Ftext\u206F')).toBe('text');
    });
  });

  // ── 6. Non-breaking space ──────────────────────────────────────────
  describe('non-breaking space', () => {
    it('converts single \\u00A0 to regular space', () => {
      expect(sanitizeField('hello\u00A0world')).toBe('hello world');
    });

    it('converts multiple \\u00A0 to regular spaces', () => {
      expect(sanitizeField('a\u00A0\u00A0b')).toBe('a  b');
    });

    it('trims leading \\u00A0 (converted to space then trimmed)', () => {
      expect(sanitizeField('\u00A0hello')).toBe('hello');
    });

    it('trims trailing \\u00A0', () => {
      expect(sanitizeField('hello\u00A0')).toBe('hello');
    });
  });

  // ── 7. ASCII control characters ────────────────────────────────────
  describe('ASCII control characters', () => {
    it('strips backspace (\\x08)', () => {
      expect(sanitizeField('hel\x08lo')).toBe('hello');
    });

    it('strips bell (\\x07)', () => {
      expect(sanitizeField('\x07text')).toBe('text');
    });

    it('strips form feed (\\x0C)', () => {
      expect(sanitizeField('te\x0Cxt')).toBe('text');
    });

    it('strips vertical tab (\\x0B)', () => {
      expect(sanitizeField('te\x0Bxt')).toBe('text');
    });

    it('strips device control chars (\\x0E-\\x1F)', () => {
      expect(sanitizeField('a\x0E\x0F\x10\x1Fb')).toBe('ab');
    });

    it('strips DEL (\\x7F)', () => {
      expect(sanitizeField('hel\x7Flo')).toBe('hello');
    });
  });

  // ── 8. Control chars NOT stripped ──────────────────────────────────
  describe('control chars NOT stripped', () => {
    it('preserves tab (\\x09) — handled by trim', () => {
      expect(sanitizeField('hello\tworld')).toBe('hello\tworld');
    });

    it('leaves normal text unaffected', () => {
      expect(sanitizeField('normal text')).toBe('normal text');
    });
  });

  // ── 9–12. Quote unwrapping ─────────────────────────────────────────
  describe('straight double quotes', () => {
    it('unwraps "Artist" → Artist', () => {
      expect(sanitizeField('"Artist"')).toBe('Artist');
    });

    it('preserves nested content inside straight double quotes', () => {
      expect(sanitizeField('"Hello World"')).toBe('Hello World');
    });
  });

  describe('straight single quotes', () => {
    it("unwraps 'Artist' → Artist", () => {
      expect(sanitizeField("'Artist'")).toBe('Artist');
    });
  });

  describe('smart double quotes', () => {
    it('unwraps \\u201CArtist\\u201D → Artist', () => {
      expect(sanitizeField('\u201CArtist\u201D')).toBe('Artist');
    });
  });

  describe('smart single quotes', () => {
    it('unwraps \\u2018Artist\\u2019 → Artist', () => {
      expect(sanitizeField('\u2018Artist\u2019')).toBe('Artist');
    });
  });

  // ── 13. Non-matching quotes ────────────────────────────────────────
  describe('non-matching quotes', () => {
    it('leaves "Artist\' unchanged (mismatched)', () => {
      expect(sanitizeField('"Artist\'')).toBe('"Artist\'');
    });

    it('leaves \'Artist" unchanged (mismatched)', () => {
      expect(sanitizeField('\'Artist"')).toBe('\'Artist"');
    });

    it('leaves \\u201CArtist\\u2019 unchanged (mismatched smart quotes)', () => {
      expect(sanitizeField('\u201CArtist\u2019')).toBe('\u201CArtist\u2019');
    });
  });

  // ── 14. Single character ───────────────────────────────────────────
  describe('single character', () => {
    it('returns single " as-is (length < 2, not unwrapped)', () => {
      expect(sanitizeField('"')).toBe('"');
    });
  });

  // ── 15. Quotes with inner whitespace ───────────────────────────────
  describe('quotes with inner whitespace', () => {
    it('trims inner whitespace after unwrapping: "  Artist  " → Artist', () => {
      expect(sanitizeField('"  Artist  "')).toBe('Artist');
    });
  });

  // ── 16. Nested quotes ──────────────────────────────────────────────
  describe('nested quotes', () => {
    it('strips only outer layer: ""Artist"" → "Artist"', () => {
      expect(sanitizeField('""Artist""')).toBe('"Artist"');
    });
  });

  // ── 17. Empty quotes ──────────────────────────────────────────────
  describe('empty quotes', () => {
    it('"" → empty string', () => {
      expect(sanitizeField('""')).toBe('');
    });

    it("'' → empty string", () => {
      expect(sanitizeField("''")).toBe('');
    });
  });

  // ── 18. Combined issues ────────────────────────────────────────────
  describe('combined issues', () => {
    it('handles NBSP + zero-width + wrapping quotes all at once', () => {
      expect(sanitizeField('"\u00A0\u200BArtist\u200B\u00A0"')).toBe('Artist');
    });
  });

  // ── 19. Unicode text preserved ─────────────────────────────────────
  describe('unicode text preserved', () => {
    it('preserves accented characters (Beyoncé)', () => {
      expect(sanitizeField('Beyoncé')).toBe('Beyoncé');
    });

    it('preserves CJK characters', () => {
      expect(sanitizeField('音楽アーティスト')).toBe('音楽アーティスト');
    });

    it('preserves emoji', () => {
      expect(sanitizeField('🎵 Music')).toBe('🎵 Music');
    });
  });

  // ── 20. Normal text unchanged ──────────────────────────────────────
  describe('normal text unchanged', () => {
    it('passes plain ASCII text through unmodified', () => {
      expect(sanitizeField('Hello World')).toBe('Hello World');
    });
  });

  // ── 21. Line separator chars ───────────────────────────────────────
  describe('line separator chars', () => {
    it('strips \\u2028 (line separator)', () => {
      expect(sanitizeField('line\u2028break')).toBe('linebreak');
    });

    it('strips \\u2029 (paragraph separator)', () => {
      expect(sanitizeField('para\u2029graph')).toBe('paragraph');
    });
  });

  // ── 22. Multiple invisible chars mixed ─────────────────────────────
  describe('multiple invisible chars mixed', () => {
    it('strips \\u200B, \\u200E, and \\u2060 all in one string', () => {
      expect(sanitizeField('\u200Bhe\u200Ello\u2060')).toBe('hello');
    });
  });
});
