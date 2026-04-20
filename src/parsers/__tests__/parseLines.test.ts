import { describe, it, expect } from 'vitest';
import { parseLines } from '../parseLines';

describe('parseLines', () => {
  describe('basic splitting', () => {
    it('splits Unix LF lines', () => {
      expect(parseLines('a\nb\nc')).toEqual(['a', 'b', 'c']);
    });

    it('splits Windows CRLF lines', () => {
      expect(parseLines('a\r\nb\r\nc')).toEqual(['a', 'b', 'c']);
    });

    it('splits old Mac CR-only lines', () => {
      expect(parseLines('a\rb\rc')).toEqual(['a', 'b', 'c']);
    });

    it('splits mixed line endings', () => {
      expect(parseLines('a\nb\r\nc\rd')).toEqual(['a', 'b', 'c', 'd']);
    });
  });

  describe('trimming', () => {
    it('trims leading/trailing whitespace from each line', () => {
      expect(parseLines('  a  \n  b  ')).toEqual(['a', 'b']);
    });

    it('trims tabs', () => {
      expect(parseLines('\ta\t\n\tb\t')).toEqual(['a', 'b']);
    });

    it('trims mixed whitespace', () => {
      expect(parseLines(' \t a \t \n \t b \t ')).toEqual(['a', 'b']);
    });
  });

  describe('empty line filtering', () => {
    it('filters empty lines', () => {
      expect(parseLines('a\n\nb')).toEqual(['a', 'b']);
    });

    it('filters whitespace-only lines', () => {
      expect(parseLines('a\n   \nb')).toEqual(['a', 'b']);
    });

    it('filters lines that are only tabs/spaces', () => {
      expect(parseLines('a\n \t \nb')).toEqual(['a', 'b']);
    });

    it('no phantom entries from trailing newlines', () => {
      expect(parseLines('a\nb\n')).toEqual(['a', 'b']);
    });

    it('no phantom entries from leading newlines', () => {
      expect(parseLines('\na\nb')).toEqual(['a', 'b']);
    });

    it('multiple consecutive empty lines filtered', () => {
      expect(parseLines('a\n\n\n\nb')).toEqual(['a', 'b']);
    });
  });

  describe('edge cases', () => {
    it('empty string returns empty array', () => {
      expect(parseLines('')).toEqual([]);
    });

    it('only whitespace returns empty array', () => {
      expect(parseLines('   ')).toEqual([]);
    });

    it('only newlines returns empty array', () => {
      expect(parseLines('\n\n\n')).toEqual([]);
    });

    it('single line without newline', () => {
      expect(parseLines('hello world')).toEqual(['hello world']);
    });

    it('single line with trailing newline', () => {
      expect(parseLines('hello world\n')).toEqual(['hello world']);
    });
  });

  describe('BOM handling', () => {
    it('strips BOM at start of text', () => {
      expect(parseLines('\uFEFFhello\nworld')).toEqual(['hello', 'world']);
    });

    it('BOM-only text returns empty array', () => {
      expect(parseLines('\uFEFF')).toEqual([]);
    });

    it('BOM followed by content produces clean lines', () => {
      expect(parseLines('\uFEFFline1\nline2\nline3')).toEqual(['line1', 'line2', 'line3']);
    });

    it('BOM + header line: first line has no BOM prefix', () => {
      const result = parseLines('\uFEFFheader');
      expect(result).toEqual(['header']);
      expect(result[0].charCodeAt(0)).toBe('h'.charCodeAt(0));
    });

    it('multiple BOMs scattered in text are all stripped', () => {
      expect(parseLines('\uFEFFa\n\uFEFFb\nc\uFEFF')).toEqual(['a', 'b', 'c']);
    });

    it('BOM after newline (mid-text) is stripped without phantom lines', () => {
      expect(parseLines('first\n\uFEFFsecond')).toEqual(['first', 'second']);
    });
  });

  describe('NUL byte handling', () => {
    it('NUL bytes are stripped from text', () => {
      expect(parseLines('a\0\nb')).toEqual(['a', 'b']);
    });

    it('NUL between characters is removed', () => {
      expect(parseLines('hel\0lo')).toEqual(['hello']);
    });

    it('multiple consecutive NULs are stripped', () => {
      expect(parseLines('a\0\0\0b')).toEqual(['ab']);
    });

    it('NUL-only text returns empty array', () => {
      expect(parseLines('\0\0\0')).toEqual([]);
    });

    it('NUL mixed with content across lines', () => {
      expect(parseLines('\0he\0llo\n\0wo\0rld\0')).toEqual(['hello', 'world']);
    });
  });

  describe('Unicode line separators', () => {
    it('vertical tab (\\v) works as line separator', () => {
      expect(parseLines('a\vb')).toEqual(['a', 'b']);
    });

    it('form feed (\\f) works as line separator', () => {
      expect(parseLines('a\fb')).toEqual(['a', 'b']);
    });

    it('Unicode Line Separator (\\u2028) works as line separator', () => {
      expect(parseLines('a\u2028b')).toEqual(['a', 'b']);
    });

    it('Unicode Paragraph Separator (\\u2029) works as line separator', () => {
      expect(parseLines('a\u2029b')).toEqual(['a', 'b']);
    });

    it('mixed separators: \\n + \\v + \\f + \\u2028 + \\u2029 all in one text', () => {
      expect(parseLines('a\nb\vc\fd\u2028e\u2029f')).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
    });

    it('multiple consecutive Unicode separators produce no empty entries', () => {
      expect(parseLines('a\v\f\u2028\u2029b')).toEqual(['a', 'b']);
    });
  });

  describe('combined file corruption', () => {
    it('BOM + CRLF + NUL all handled simultaneously', () => {
      expect(parseLines('\uFEFFhe\0llo\r\nwo\0rld')).toEqual(['hello', 'world']);
    });

    it('file with every type of line ending', () => {
      expect(parseLines('a\nb\r\nc\rd\ve\ff\u2028g\u2029h')).toEqual([
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
      ]);
    });

    it('NUL bytes inside line content still produce readable output', () => {
      expect(parseLines('h\0e\0l\0l\0o\nw\0o\0r\0l\0d')).toEqual(['hello', 'world']);
    });

    it('BOM + empty lines + trailing CRLF produces correct line count', () => {
      expect(parseLines('\uFEFFfirst\r\n\r\nsecond\r\n')).toEqual(['first', 'second']);
    });

    it('extremely corrupted text parses correctly', () => {
      const corrupted = '\uFEFF\0  he\0llo \r\n\v \uFEFF \f\n\0wo\0rld\0\u2028\u2029  \r\n';
      expect(parseLines(corrupted)).toEqual(['hello', 'world']);
    });
  });
});
