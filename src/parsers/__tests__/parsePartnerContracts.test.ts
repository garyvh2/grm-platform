import { parsePartnerContracts } from '../parsePartnerContracts';

describe('parsePartnerContracts', () => {
  // ── 1. Core parsing ───────────────────────────────────────────────────

  describe('core parsing', () => {
    it('parses reference 2-row dataset (ITunes, YouTube)', () => {
      const input = 'Partner|Usage\nITunes|digital download\nYouTube|streaming';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
        { partner: 'YouTube', usage: 'streaming' },
      ]);
    });

    it('skips header row', () => {
      const input = 'Partner|Usage\nSpotify|streaming';
      const result = parsePartnerContracts(input);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ partner: 'Spotify', usage: 'streaming' });
    });

    it('parses a single data row', () => {
      const input = 'Partner|Usage\nSpotify|streaming';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'Spotify', usage: 'streaming' }]);
    });

    it('parses many rows (5+)', () => {
      const input = [
        'Partner|Usage',
        'ITunes|digital download',
        'YouTube|streaming',
        'Spotify|streaming',
        'Deezer|streaming',
        'Amazon|digital download',
        'Tidal|hi-res streaming',
      ].join('\n');
      const result = parsePartnerContracts(input);
      expect(result).toHaveLength(6);
      expect(result[0]).toEqual({ partner: 'ITunes', usage: 'digital download' });
      expect(result[5]).toEqual({ partner: 'Tidal', usage: 'hi-res streaming' });
    });
  });

  // ── 2. Duplicate handling ─────────────────────────────────────────────

  describe('duplicate handling', () => {
    it('preserves same partner with different usages', () => {
      const input = 'Partner|Usage\nITunes|digital download\nITunes|streaming';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
        { partner: 'ITunes', usage: 'streaming' },
      ]);
    });

    it('preserves exact duplicate rows (parser does not deduplicate)', () => {
      const input = 'Partner|Usage\nSpotify|streaming\nSpotify|streaming';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'Spotify', usage: 'streaming' },
        { partner: 'Spotify', usage: 'streaming' },
      ]);
    });
  });

  // ── 3. Line ending normalization ──────────────────────────────────────

  describe('line ending normalization', () => {
    it('handles Windows CRLF (\\r\\n)', () => {
      const input = 'Partner|Usage\r\nITunes|digital download\r\nYouTube|streaming';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
        { partner: 'YouTube', usage: 'streaming' },
      ]);
    });

    it('handles old Mac CR only (\\r)', () => {
      const input = 'Partner|Usage\rITunes|digital download\rYouTube|streaming';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
        { partner: 'YouTube', usage: 'streaming' },
      ]);
    });

    it('handles mixed \\r\\n and \\n', () => {
      const input = 'Partner|Usage\r\nITunes|digital download\nYouTube|streaming';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
        { partner: 'YouTube', usage: 'streaming' },
      ]);
    });
  });

  // ── 4. Whitespace resilience ──────────────────────────────────────────

  describe('whitespace resilience', () => {
    it('trims tabs and spaces around pipes', () => {
      const input = 'Partner|Usage\n\tITunes\t | \tdigital download\t';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
      ]);
    });

    it('filters whitespace-only lines between valid rows', () => {
      const input = 'Partner|Usage\n   \nITunes|digital download\n  \t \nYouTube|streaming';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
        { partner: 'YouTube', usage: 'streaming' },
      ]);
    });

    it('handles trailing and leading newlines', () => {
      const input = '\n\nPartner|Usage\nITunes|digital download\n\n\n';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
      ]);
    });

    it('ignores extra pipes — only first 2 fields used', () => {
      const input = 'Partner|Usage\nITunes|digital download|extra|more';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
      ]);
    });
  });

  // ── 5. Malformed input handling (BULLETPROOF) ─────────────────────────

  describe('malformed input handling', () => {
    it('skips row with no pipe (single word)', () => {
      const input = 'Partner|Usage\nITunes\nYouTube|streaming';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'YouTube', usage: 'streaming' }]);
    });

    it('skips row with pipe but empty partner', () => {
      const input = 'Partner|Usage\n|streaming\nYouTube|streaming';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'YouTube', usage: 'streaming' }]);
    });

    it('skips row with pipe but empty usage', () => {
      const input = 'Partner|Usage\nITunes|\nYouTube|streaming';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'YouTube', usage: 'streaming' }]);
    });

    it('skips row with only pipes (||)', () => {
      const input = 'Partner|Usage\n||\nYouTube|streaming';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'YouTube', usage: 'streaming' }]);
    });

    it('returns [] for empty string', () => {
      expect(parsePartnerContracts('')).toEqual([]);
    });

    it('returns [] for header-only input', () => {
      expect(parsePartnerContracts('Partner|Usage')).toEqual([]);
    });

    it('returns [] for header-only with trailing newline', () => {
      expect(parsePartnerContracts('Partner|Usage\n')).toEqual([]);
    });

    it('returns [] for whitespace-only input', () => {
      expect(parsePartnerContracts('   \t  \n  \n  ')).toEqual([]);
    });

    it('returns [] when all rows are malformed', () => {
      const input = 'Partner|Usage\nno-pipe\n|only-usage\nonly-partner|\n||';
      expect(parsePartnerContracts(input)).toEqual([]);
    });

    it('returns only valid rows from a mix of valid and malformed', () => {
      const input = [
        'Partner|Usage',
        'no-pipe-here',
        'ITunes|digital download',
        '|missing-partner',
        'YouTube|streaming',
        'missing-usage|',
        '||',
      ].join('\n');
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
        { partner: 'YouTube', usage: 'streaming' },
      ]);
    });
  });

  // ── 6. Unicode and special characters ─────────────────────────────────

  describe('unicode and special characters', () => {
    it('handles accented characters in partner names', () => {
      const input = 'Partner|Usage\nDéèzer|streaming\nBücher|téléchargement';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'Déèzer', usage: 'streaming' },
        { partner: 'Bücher', usage: 'téléchargement' },
      ]);
    });

    it('handles special chars in usage names', () => {
      const input = 'Partner|Usage\nPartner-1|usage/type (v2)\nPartner_2|usage & sync';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'Partner-1', usage: 'usage/type (v2)' },
        { partner: 'Partner_2', usage: 'usage & sync' },
      ]);
    });
  });

  // ── 7. Realistic edge cases ───────────────────────────────────────────

  describe('realistic edge cases', () => {
    it('handles very long partner and usage names', () => {
      const longPartner = 'A'.repeat(500);
      const longUsage = 'B'.repeat(500);
      const input = `Partner|Usage\n${longPartner}|${longUsage}`;
      const result = parsePartnerContracts(input);
      expect(result).toEqual([{ partner: longPartner, usage: longUsage }]);
    });

    it('handles usage with internal spaces ("digital download")', () => {
      const input = 'Partner|Usage\nITunes|digital download';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
      ]);
    });
  });

  // ── 8. BOM and encoding artifacts ───────────────────────────────────────

  describe('BOM and encoding artifacts', () => {
    it('file starting with BOM parses correctly', () => {
      const input = '\uFEFFPartner|Usage\nITunes|digital download';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
      ]);
    });

    it('BOM in middle of partner name is stripped', () => {
      const input = 'Partner|Usage\nI\uFEFFTunes|streaming';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'ITunes', usage: 'streaming' }]);
    });

    it('NUL bytes in field values are handled', () => {
      const input = 'Partner|Usage\nITu\0nes|stre\0aming';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'ITunes', usage: 'streaming' }]);
    });

    it('file with BOM + CRLF line endings', () => {
      const input = '\uFEFFPartner|Usage\r\nITunes|digital download\r\nYouTube|streaming';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
        { partner: 'YouTube', usage: 'streaming' },
      ]);
    });

    it('NUL byte between characters is stripped: "You\\0Tube" → "YouTube"', () => {
      const input = 'Partner|Usage\nYou\0Tube|streaming';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'YouTube', usage: 'streaming' }]);
    });
  });

  // ── 9. Invisible unicode in fields ──────────────────────────────────────

  describe('invisible unicode in fields', () => {
    it('zero-width space in partner name is stripped', () => {
      const input = 'Partner|Usage\nYou\u200BTube|streaming';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'YouTube', usage: 'streaming' }]);
    });

    it('zero-width joiner in usage is stripped', () => {
      const input = 'Partner|Usage\nITunes|digital\u200Ddownload';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digitaldownload' },
      ]);
    });

    it('directional mark in partner name is stripped', () => {
      const input = 'Partner|Usage\n\u200EITunes|streaming';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'ITunes', usage: 'streaming' }]);
    });

    it('non-breaking space in usage is replaced with regular space', () => {
      const input = 'Partner|Usage\nITunes|digital\u00A0download';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
      ]);
    });

    it('multiple invisible chars in both fields are all cleaned', () => {
      const input = 'Partner|Usage\n\u200BI\u200DTu\u200Enes|digi\u200Btal\u200D down\u200Eload';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
      ]);
    });

    it('NBSP in partner name is preserved as space', () => {
      const input = 'Partner|Usage\nI\u00A0Tunes|streaming';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'I Tunes', usage: 'streaming' }]);
    });
  });

  // ── 10. Wrapping quotes (Excel/CSV export) ─────────────────────────────

  describe('wrapping quotes (Excel/CSV export)', () => {
    it('both fields wrapped in double quotes are parsed', () => {
      const input = 'Partner|Usage\n"ITunes"|"digital download"';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
      ]);
    });

    it('fields wrapped in single quotes are parsed', () => {
      const input = "Partner|Usage\n'YouTube'|'streaming'";
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'YouTube', usage: 'streaming' }]);
    });

    it('smart double quotes are unwrapped', () => {
      const input = 'Partner|Usage\n\u201CITunes\u201D|\u201Cstreaming\u201D';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'ITunes', usage: 'streaming' }]);
    });

    it('smart single quotes are unwrapped', () => {
      const input = 'Partner|Usage\n\u2018YouTube\u2019|\u2018streaming\u2019';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'YouTube', usage: 'streaming' }]);
    });

    it('mixed: one field quoted, other not', () => {
      const input = 'Partner|Usage\n"ITunes"|streaming';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'ITunes', usage: 'streaming' }]);
    });

    it('empty quoted field treated as empty — row skipped', () => {
      const input = 'Partner|Usage\n""|streaming\nYouTube|""\n""|""';
      expect(parsePartnerContracts(input)).toEqual([]);
    });
  });

  // ── 11. Control characters in fields ───────────────────────────────────

  describe('control characters in fields', () => {
    it('backspace in partner name is stripped', () => {
      const input = 'Partner|Usage\nITu\x08nes|streaming';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'ITunes', usage: 'streaming' }]);
    });

    it('bell in usage is stripped', () => {
      const input = 'Partner|Usage\nITunes|stre\x07aming';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'ITunes', usage: 'streaming' }]);
    });

    it('DEL in field is stripped', () => {
      const input = 'Partner|Usage\nYou\x7FTube|streaming';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'YouTube', usage: 'streaming' }]);
    });

    it('row with control chars but otherwise valid parses correctly', () => {
      const input = 'Partner|Usage\n\x01I\x02Tunes\x03|\x04streaming\x05';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'ITunes', usage: 'streaming' }]);
    });

    it('multiple different control chars in one field are all stripped', () => {
      const input = 'Partner|Usage\n\x01\x02\x03I\x04T\x05u\x06n\x07e\x08s\x0E\x0F|streaming';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'ITunes', usage: 'streaming' }]);
    });
  });

  // ── 12. Unicode line separators as file line endings ───────────────────

  describe('Unicode line separators as file line endings', () => {
    it('file using \\u2028 as line separator parses correctly', () => {
      const input = 'Partner|Usage\u2028ITunes|digital download\u2028YouTube|streaming';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
        { partner: 'YouTube', usage: 'streaming' },
      ]);
    });

    it('file using \\u2029 as line separator parses correctly', () => {
      const input = 'Partner|Usage\u2029ITunes|digital download\u2029YouTube|streaming';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
        { partner: 'YouTube', usage: 'streaming' },
      ]);
    });

    it('file using \\v (vertical tab) as line separator', () => {
      const input = 'Partner|Usage\vITunes|digital download\vYouTube|streaming';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
        { partner: 'YouTube', usage: 'streaming' },
      ]);
    });

    it('file using \\f (form feed) as line separator', () => {
      const input = 'Partner|Usage\fITunes|digital download\fYouTube|streaming';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
        { partner: 'YouTube', usage: 'streaming' },
      ]);
    });
  });

  // ── 13. Combined corruption scenarios ──────────────────────────────────

  describe('combined corruption scenarios', () => {
    it('BOM + quoted fields + NBSP + CRLF all in one file', () => {
      const input =
        '\uFEFFPartner|Usage\r\n"ITunes"|"digital\u00A0download"\r\n"YouTube"|"streaming"';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
        { partner: 'YouTube', usage: 'streaming' },
      ]);
    });

    it('every field has a different invisible char — all cleaned, row valid', () => {
      const input = 'Partner|Usage\n\u200BITunes|digi\u200Dtal download';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'digital download' },
      ]);
    });

    it('header has BOM and quotes, data rows have NBSP', () => {
      const input =
        '\uFEFF"Partner"|"Usage"\nI\u00A0Tunes|digital\u00A0download\nYouTube|streaming';
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'I Tunes', usage: 'digital download' },
        { partner: 'YouTube', usage: 'streaming' },
      ]);
    });

    it('10 rows each with a different corruption type — all parse correctly', () => {
      const input = [
        'Partner|Usage',
        '\uFEFFITunes|streaming', // BOM
        'You\0Tube|streaming', // NUL
        'Spotify\u200B|streaming', // zero-width space
        'Deezer|strea\u200Dming', // zero-width joiner
        '\u200EAmazon|streaming', // directional mark
        'Tidal|digital\u00A0download', // NBSP
        '"Pandora"|"streaming"', // double quotes
        '\u201CSoundCloud\u201D|streaming', // smart double quotes
        'Napster\x08|str\x07eaming', // control chars
        'Band\x7Fcamp|streaming', // DEL
      ].join('\n');
      expect(parsePartnerContracts(input)).toEqual([
        { partner: 'ITunes', usage: 'streaming' },
        { partner: 'YouTube', usage: 'streaming' },
        { partner: 'Spotify', usage: 'streaming' },
        { partner: 'Deezer', usage: 'streaming' },
        { partner: 'Amazon', usage: 'streaming' },
        { partner: 'Tidal', usage: 'digital download' },
        { partner: 'Pandora', usage: 'streaming' },
        { partner: 'SoundCloud', usage: 'streaming' },
        { partner: 'Napster', usage: 'streaming' },
        { partner: 'Bandcamp', usage: 'streaming' },
      ]);
    });

    it('zero-width chars around pipe delimiters parse correctly', () => {
      const input = 'Partner|Usage\nITunes\u200B|\u200Bstreaming';
      expect(parsePartnerContracts(input)).toEqual([{ partner: 'ITunes', usage: 'streaming' }]);
    });
  });
});
