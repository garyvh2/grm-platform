import { parseMusicContracts } from '../parseMusicContracts';

const DATASET = `Artist|Title|Usages|StartDate|EndDate
Tinie Tempah|Frisky (Live from SoHo)|digital download, streaming|2012-02-01|
Tinie Tempah|Miami 2 Ibiza|digital download|2012-02-01|
Tinie Tempah|Till I'm Gone|digital download|2012-08-01|
Monkey Claw|Black Mountain|digital download|2012-02-01|
Monkey Claw|Iron Horse|digital download, streaming|2012-06-01|
Monkey Claw|Motor Mouth|digital download, streaming|2011-03-01|
Monkey Claw|Christmas Special|streaming|2012-12-25|2012-12-31`;

// ---------------------------------------------------------------------------
// 1. Core parsing (reference dataset)
// ---------------------------------------------------------------------------
describe('core parsing – reference dataset', () => {
  it('parses the full 7-row reference dataset correctly', () => {
    const result = parseMusicContracts(DATASET);
    expect(result).toHaveLength(7);
  });

  it('skips the header row', () => {
    const result = parseMusicContracts(DATASET);
    expect(result.find((c) => c.artist === 'Artist')).toBeUndefined();
  });

  it('first row has correct fields', () => {
    const result = parseMusicContracts(DATASET);
    expect(result[0]).toEqual({
      artist: 'Tinie Tempah',
      title: 'Frisky (Live from SoHo)',
      usages: ['digital download', 'streaming'],
      startDate: '2012-02-01',
      endDate: null,
    });
  });

  it('last row has correct endDate (Christmas Special)', () => {
    const result = parseMusicContracts(DATASET);
    expect(result[6]).toEqual({
      artist: 'Monkey Claw',
      title: 'Christmas Special',
      usages: ['streaming'],
      startDate: '2012-12-25',
      endDate: '2012-12-31',
    });
  });
});

// ---------------------------------------------------------------------------
// 2. Usages parsing
// ---------------------------------------------------------------------------
describe('usages parsing', () => {
  it('splits comma-separated usages and trims them', () => {
    const input = 'H|H|H|H|H\nAce|Song|digital download , streaming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].usages).toEqual(['digital download', 'streaming']);
  });

  it('handles a single usage (no comma)', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].usages).toEqual(['streaming']);
  });

  it('handles a large number of usages (6+)', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming, download, sync, radio, tv, film|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].usages).toEqual(['streaming', 'download', 'sync', 'radio', 'tv', 'film']);
    expect(result[0].usages).toHaveLength(6);
  });

  it('filters empty entries between commas: "a, , b" → ["a", "b"]', () => {
    const input = 'H|H|H|H|H\nAce|Song|a, , b|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].usages).toEqual(['a', 'b']);
  });

  it('skips row when usages field is entirely empty', () => {
    const input = 'H|H|H|H|H\nAce|Song||2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result).toEqual([]);
  });

  it('skips row when all comma-separated usages are blank', () => {
    const input = 'H|H|H|H|H\nAce|Song|, , ,|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 3. EndDate handling
// ---------------------------------------------------------------------------
describe('endDate handling', () => {
  it('empty endDate → null', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].endDate).toBeNull();
  });

  it('whitespace-only endDate → null', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|2020-01-01|   ';
    const result = parseMusicContracts(input);
    expect(result[0].endDate).toBeNull();
  });

  it('present endDate → correct string', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|2020-01-01|2020-12-31';
    const result = parseMusicContracts(input);
    expect(result[0].endDate).toBe('2020-12-31');
  });

  it('missing endDate field (only 4 fields, no trailing pipe) → null', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|2020-01-01';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0].endDate).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 4. Line ending normalization
// ---------------------------------------------------------------------------
describe('line ending normalization', () => {
  it('handles Windows CRLF (\\r\\n)', () => {
    const input = 'H|H|H|H|H\r\nAce|Song|streaming|2020-01-01|\r\n';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0].artist).toBe('Ace');
  });

  it('handles old Mac CR-only (\\r)', () => {
    const input = 'H|H|H|H|H\rAce|Song|streaming|2020-01-01|\r';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0].artist).toBe('Ace');
  });

  it('handles mixed \\r\\n and \\n', () => {
    const input =
      'H|H|H|H|H\r\nAce|Song A|streaming|2020-01-01|\nBob|Song B|download|2021-05-01|2021-12-31\r\n';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(2);
    expect(result[0].artist).toBe('Ace');
    expect(result[1].artist).toBe('Bob');
    expect(result[1].endDate).toBe('2021-12-31');
  });
});

// ---------------------------------------------------------------------------
// 5. Whitespace resilience
// ---------------------------------------------------------------------------
describe('whitespace resilience', () => {
  it('trims tabs and spaces around pipe delimiters', () => {
    const input =
      'H|H|H|H|H\n  Ace\t| \tMy Song\t |  streaming , download  |  2020-01-01  |  2020-12-31  ';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      artist: 'Ace',
      title: 'My Song',
      usages: ['streaming', 'download'],
      startDate: '2020-01-01',
      endDate: '2020-12-31',
    });
  });

  it('filters whitespace-only lines between valid rows', () => {
    const input =
      'H|H|H|H|H\nAce|Song A|streaming|2020-01-01|\n   \n\nBob|Song B|download|2021-01-01|';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(2);
    expect(result[0].artist).toBe('Ace');
    expect(result[1].artist).toBe('Bob');
  });

  it('trailing and leading newlines produce no phantom entries', () => {
    const input = '\n\nH|H|H|H|H\nAce|Song|streaming|2020-01-01|\n\n';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0].artist).toBe('Ace');
  });

  it('trims whitespace on every field correctly', () => {
    const input = 'H|H|H|H|H\n  Ace  |  Song  |  streaming  |  2020-01-01  |  2020-12-31  ';
    const result = parseMusicContracts(input);
    expect(result[0]).toEqual({
      artist: 'Ace',
      title: 'Song',
      usages: ['streaming'],
      startDate: '2020-01-01',
      endDate: '2020-12-31',
    });
  });
});

// ---------------------------------------------------------------------------
// 6. Malformed input handling (BULLETPROOF)
// ---------------------------------------------------------------------------
describe('malformed input handling', () => {
  it('row with fewer than 4 fields → skipped (not crash, not undefined)', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming';
    const result = parseMusicContracts(input);
    expect(result).toEqual([]);
  });

  it('row with only 1 field → skipped', () => {
    const input = 'H|H|H|H|H\nJustOneField';
    const result = parseMusicContracts(input);
    expect(result).toEqual([]);
  });

  it('row with pipe but empty fields on both sides → skipped', () => {
    const input = 'H|H|H|H|H\n|';
    const result = parseMusicContracts(input);
    expect(result).toEqual([]);
  });

  it('row missing artist (empty first field) → skipped', () => {
    const input = 'H|H|H|H|H\n|Song|streaming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result).toEqual([]);
  });

  it('row missing title → skipped', () => {
    const input = 'H|H|H|H|H\nAce||streaming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result).toEqual([]);
  });

  it('row missing startDate → skipped', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming||';
    const result = parseMusicContracts(input);
    expect(result).toEqual([]);
  });

  it('empty string input → []', () => {
    expect(parseMusicContracts('')).toEqual([]);
  });

  it('header-only input → []', () => {
    expect(parseMusicContracts('Artist|Title|Usages|StartDate|EndDate\n')).toEqual([]);
  });

  it('whitespace-only input → []', () => {
    expect(parseMusicContracts('   \n  \n   ')).toEqual([]);
  });

  it('only malformed rows (all skipped) → []', () => {
    const input = 'H|H|H|H|H\nBad row\nAnother|bad\n|||\n';
    const result = parseMusicContracts(input);
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 7. Unicode and special characters
// ---------------------------------------------------------------------------
describe('unicode and special characters', () => {
  it('handles accented characters (Beyoncé, Déjà Vu)', () => {
    const input = 'H|H|H|H|H\nBeyoncé|Déjà Vu|streaming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].artist).toBe('Beyoncé');
    expect(result[0].title).toBe('Déjà Vu');
  });

  it('handles apostrophes, ampersands, and parentheses', () => {
    const input = "H|H|H|H|H\nO'Brien|Rock & Roll (Deluxe)|download|2021-01-01|";
    const result = parseMusicContracts(input);
    expect(result[0].artist).toBe("O'Brien");
    expect(result[0].title).toBe('Rock & Roll (Deluxe)');
  });

  it('handles smart quotes', () => {
    const input = 'H|H|H|H|H\nAce|\u201CSmart\u201D Title|streaming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].title).toBe('\u201CSmart\u201D Title');
  });
});

// ---------------------------------------------------------------------------
// 8. Realistic edge cases
// ---------------------------------------------------------------------------
describe('realistic edge cases', () => {
  it('handles very long artist and title names', () => {
    const longArtist = 'A'.repeat(500);
    const longTitle = 'T'.repeat(500);
    const input = `H|H|H|H|H\n${longArtist}|${longTitle}|streaming|2020-01-01|`;
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0].artist).toBe(longArtist);
    expect(result[0].title).toBe(longTitle);
  });

  it('handles usages with internal spaces (e.g., "digital download")', () => {
    const input = 'H|H|H|H|H\nAce|Song|digital download, physical release|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].usages).toEqual(['digital download', 'physical release']);
  });

  it('handles extra pipes (more than 5 fields) — parses correctly', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|2020-01-01|2020-12-31|extra|more';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      artist: 'Ace',
      title: 'Song',
      usages: ['streaming'],
      startDate: '2020-01-01',
      endDate: '2020-12-31',
    });
  });

  it('handles trailing newlines and empty lines on the reference dataset', () => {
    const result = parseMusicContracts(DATASET + '\n\n');
    expect(result).toHaveLength(7);
  });
});

// ---------------------------------------------------------------------------
// 9. BOM and encoding artifacts
// ---------------------------------------------------------------------------
describe('BOM and encoding artifacts', () => {
  it('file starting with BOM parses correctly — header skipped, data rows work', () => {
    const input = '\uFEFFArtist|Title|Usages|StartDate|EndDate\nAce|Song|streaming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0].artist).toBe('Ace');
  });

  it('BOM-prefixed file with reference dataset produces same 7 rows', () => {
    const result = parseMusicContracts('\uFEFF' + DATASET);
    expect(result).toHaveLength(7);
  });

  it('BOM character in middle of artist name is stripped', () => {
    const input = 'H|H|H|H|H\nMon\uFEFFkey|Song|streaming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].artist).toBe('Monkey');
  });

  it('NUL bytes in field values are handled (content around NULs preserved)', () => {
    const input = 'H|H|H|H|H\nA\0ce|So\0ng|streaming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0].artist).toBe('Ace');
    expect(result[0].title).toBe('Song');
  });

  it('file with both BOM and CRLF line endings', () => {
    const input =
      '\uFEFFH|H|H|H|H\r\nAce|Song|streaming|2020-01-01|\r\nBob|Track|download|2021-03-15|2021-12-31\r\n';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(2);
    expect(result[0].artist).toBe('Ace');
    expect(result[1].endDate).toBe('2021-12-31');
  });
});

// ---------------------------------------------------------------------------
// 10. Invisible unicode in fields
// ---------------------------------------------------------------------------
describe('invisible unicode in fields', () => {
  it('zero-width space (\\u200B) in artist name stripped: "Mon\\u200Bkey" → "Monkey"', () => {
    const input = 'H|H|H|H|H\nMon\u200Bkey|Song|streaming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].artist).toBe('Monkey');
  });

  it('zero-width joiner (\\u200D) in title stripped', () => {
    const input = 'H|H|H|H|H\nAce|My\u200DSong|streaming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].title).toBe('MySong');
  });

  it('directional marks (\\u200E, \\u200F) in fields stripped', () => {
    const input = 'H|H|H|H|H\n\u200EAce\u200F|So\u200Eng|streaming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].artist).toBe('Ace');
    expect(result[0].title).toBe('Song');
  });

  it('non-breaking space (\\u00A0) in artist name normalized to space: "Monkey\\u00A0Claw" → "Monkey Claw"', () => {
    const input = 'H|H|H|H|H\nMonkey\u00A0Claw|Song|streaming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].artist).toBe('Monkey Claw');
  });

  it('NBSP in usage type normalized: "digital\\u00A0download" → "digital download"', () => {
    const input = 'H|H|H|H|H\nAce|Song|digital\u00A0download|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].usages).toEqual(['digital download']);
  });

  it('multiple invisible chars mixed in one row — all cleaned, row parses correctly', () => {
    const input =
      'H|H|H|H|H\n\u200BAc\u200De\u200F|So\u200Eng\u200B|stre\u200Daming|2020-01-01|2020-12-31';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0].artist).toBe('Ace');
    expect(result[0].title).toBe('Song');
    expect(result[0].usages).toEqual(['streaming']);
    expect(result[0].endDate).toBe('2020-12-31');
  });
});

// ---------------------------------------------------------------------------
// 11. Wrapping quotes (Excel/CSV export)
// ---------------------------------------------------------------------------
describe('wrapping quotes (Excel/CSV export)', () => {
  it('all fields wrapped in straight double quotes — parsed correctly', () => {
    const input = 'H|H|H|H|H\n"Ace"|"Song"|"streaming"|"2020-01-01"|"2020-12-31"';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      artist: 'Ace',
      title: 'Song',
      usages: ['streaming'],
      startDate: '2020-01-01',
      endDate: '2020-12-31',
    });
  });

  it('fields wrapped in single quotes — parsed correctly', () => {
    const input = "H|H|H|H|H\n'Ace'|'Song'|'streaming'|'2020-01-01'|''";
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0].artist).toBe('Ace');
    expect(result[0].endDate).toBeNull();
  });

  it('smart/curly quotes (\\u201C...\\u201D) — parsed correctly', () => {
    const input =
      'H|H|H|H|H\n\u201CAce\u201D|\u201CSong\u201D|\u201Cstreaming\u201D|\u201C2020-01-01\u201D|\u201C2020-12-31\u201D';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0].artist).toBe('Ace');
    expect(result[0].title).toBe('Song');
    expect(result[0].endDate).toBe('2020-12-31');
  });

  it('individually quoted usage items among unquoted — each unwrapped cleanly', () => {
    const input = 'H|H|H|H|H\nAce|Song|"streaming", "download", sync|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].usages).toEqual(['streaming', 'download', 'sync']);
  });

  it('mixed: some fields quoted, some not — all parsed correctly', () => {
    const input = 'H|H|H|H|H\n"Ace"|Song|"streaming"|2020-01-01|"2020-12-31"';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0].artist).toBe('Ace');
    expect(result[0].title).toBe('Song');
    expect(result[0].endDate).toBe('2020-12-31');
  });

  it('empty quoted endDate "" → null (perpetual)', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|2020-01-01|""';
    const result = parseMusicContracts(input);
    expect(result[0].endDate).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 12. Date normalization
// ---------------------------------------------------------------------------
describe('date normalization', () => {
  it('slash-separated date: 2012/01/01 → normalizes to 2012-01-01', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|2012/01/01|';
    const result = parseMusicContracts(input);
    expect(result[0].startDate).toBe('2012-01-01');
  });

  it('ISO datetime suffix: 2012-01-01T00:00:00 → 2012-01-01', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|2012-01-01T00:00:00|';
    const result = parseMusicContracts(input);
    expect(result[0].startDate).toBe('2012-01-01');
  });

  it('ISO datetime with Z: 2012-01-01T00:00:00Z → 2012-01-01', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|2012-01-01T00:00:00Z|';
    const result = parseMusicContracts(input);
    expect(result[0].startDate).toBe('2012-01-01');
  });

  it('ISO datetime with timezone: 2012-01-01T00:00:00+05:30 → 2012-01-01', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|2012-01-01T00:00:00+05:30|';
    const result = parseMusicContracts(input);
    expect(result[0].startDate).toBe('2012-01-01');
  });

  it('spaces in date: "2012 - 01 - 01" → normalizes to 2012-01-01', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|2012 - 01 - 01|';
    const result = parseMusicContracts(input);
    expect(result[0].startDate).toBe('2012-01-01');
  });

  it('invalid startDate (alphabetic like "March") → row skipped', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|March|';
    const result = parseMusicContracts(input);
    expect(result).toEqual([]);
  });

  it('invalid startDate (partial like "2012-01") → row skipped', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|2012-01|';
    const result = parseMusicContracts(input);
    expect(result).toEqual([]);
  });

  it('invalid startDate (numbers but wrong format "20120101") → row skipped', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|20120101|';
    const result = parseMusicContracts(input);
    expect(result).toEqual([]);
  });

  it('invalid endDate → treated as null (perpetual), row NOT skipped', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|2020-01-01|not-a-date';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0].endDate).toBeNull();
  });

  it('valid startDate with invalid endDate — row included with null endDate', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|2020-01-01|December';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0].startDate).toBe('2020-01-01');
    expect(result[0].endDate).toBeNull();
  });

  it('slash-separated endDate: 2012/12/31 → normalizes to 2012-12-31', () => {
    const input = 'H|H|H|H|H\nAce|Song|streaming|2012-01-01|2012/12/31';
    const result = parseMusicContracts(input);
    expect(result[0].endDate).toBe('2012-12-31');
  });
});

// ---------------------------------------------------------------------------
// 13. Control characters in fields
// ---------------------------------------------------------------------------
describe('control characters in fields', () => {
  it('backspace (\\x08) in artist name stripped', () => {
    const input = 'H|H|H|H|H\nA\x08ce|Song|streaming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].artist).toBe('Ace');
  });

  it('bell character (\\x07) in title stripped', () => {
    const input = 'H|H|H|H|H\nAce|So\x07ng|streaming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].title).toBe('Song');
  });

  it('form feed (\\x0C) inside a field acts as line separator — row is split and skipped', () => {
    const input = 'H|H|H|H|H\nAce|Song|strea\x0Cming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result).toEqual([]);
  });

  it('DEL (\\x7F) in field value stripped', () => {
    const input = 'H|H|H|H|H\nAce|So\x7Fng|streaming|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].title).toBe('Song');
  });

  it('row with control chars in every field — still parses if fields are otherwise valid', () => {
    const input = 'H|H|H|H|H\nA\x07ce|S\x08ong|str\x0Eeaming|2020-01-01|2020\x7F-12-31';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0].artist).toBe('Ace');
    expect(result[0].title).toBe('Song');
    expect(result[0].usages).toEqual(['streaming']);
    expect(result[0].startDate).toBe('2020-01-01');
    expect(result[0].endDate).toBe('2020-12-31');
  });
});

// ---------------------------------------------------------------------------
// 14. Adversarial and combined corruption
// ---------------------------------------------------------------------------
describe('adversarial and combined corruption', () => {
  it('file with BOM + NUL + NBSP + zero-width + CRLF + quoted fields — parses correctly', () => {
    const input =
      '\uFEFF"H"|"H"|"H"|"H"|"H"\r\n' +
      '"\u200BAc\0e"|"So\u00A0ng"|"stre\u200Daming"|"2020-01-01"|"2020-12-31"\r\n';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0].artist).toBe('Ace');
    expect(result[0].title).toBe('So ng');
    expect(result[0].usages).toEqual(['streaming']);
    expect(result[0].startDate).toBe('2020-01-01');
    expect(result[0].endDate).toBe('2020-12-31');
  });

  it('header row has BOM and quotes — data rows still parse', () => {
    const input =
      '\uFEFF"Artist"|"Title"|"Usages"|"StartDate"|"EndDate"\n' +
      'Ace|Song|streaming|2020-01-01|2020-12-31\n';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0].artist).toBe('Ace');
  });

  it('row where every field has different corruption type — still produces valid contract', () => {
    const input =
      'H|H|H|H|H\n' + '\u200BAce\u200F|So\x07ng|digital\u00A0download|2020/01/01|"2020-12-31"';
    const result = parseMusicContracts(input);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      artist: 'Ace',
      title: 'Song',
      usages: ['digital download'],
      startDate: '2020-01-01',
      endDate: '2020-12-31',
    });
  });

  it('multiple rows with random corruption sprinkled — all valid rows extracted', () => {
    const rows = [
      'Artist|Title|Usages|StartDate|EndDate',
      '\u200BAce|Song\u200D A|streaming|2020-01-01|',
      '"Bob"|"Track\x07 B"|"download"|"2021-03-15"|"2021-12-31"',
      'Ch\0arlie|So\u00A0ng C|digital\u00A0download, streaming|2019/06/01|',
      '\uFEFFDave|Song D|sync|2018-01-01T00:00:00|2018-12-31',
      'Eve\u200E|Song\u200F E|radio|2017 - 05 - 10|',
      '|Missing Artist|streaming|2020-01-01|',
      'Fra\x08nk|Song F|tv, film|2016-01-01|not-valid',
      'Grace|Song G|streaming|bad-date|',
      'Ha\x07nk|\x0ESong H|download|2022-01-01|2022/06/30',
      'Ivy\u200B|"Song\u00A0I"|digital\u00A0download|2023-01-01|""',
    ];
    const input = rows.join('\n');
    const result = parseMusicContracts(input);

    // Row 6 (|Missing Artist) is skipped: empty artist
    // Row 8 (Grace) is skipped: invalid startDate
    expect(result).toHaveLength(8);

    expect(result[0].artist).toBe('Ace');
    expect(result[0].title).toBe('Song A');

    expect(result[1].artist).toBe('Bob');
    expect(result[1].title).toBe('Track B');
    expect(result[1].endDate).toBe('2021-12-31');

    expect(result[2].artist).toBe('Charlie');
    expect(result[2].title).toBe('So ng C');
    expect(result[2].usages).toEqual(['digital download', 'streaming']);

    expect(result[3].artist).toBe('Dave');
    expect(result[3].startDate).toBe('2018-01-01');
    expect(result[3].endDate).toBe('2018-12-31');

    expect(result[4].artist).toBe('Eve');
    expect(result[4].startDate).toBe('2017-05-10');

    expect(result[5].artist).toBe('Frank');
    expect(result[5].usages).toEqual(['tv', 'film']);
    expect(result[5].endDate).toBeNull();

    expect(result[6].artist).toBe('Hank');
    expect(result[6].title).toBe('Song H');
    expect(result[6].endDate).toBe('2022-06-30');

    expect(result[7].artist).toBe('Ivy');
    expect(result[7].usages).toEqual(['digital download']);
    expect(result[7].endDate).toBeNull();
  });

  it('entire usages field wrapped in quotes with NBSP between comma-separated items', () => {
    const input = 'H|H|H|H|H\nAce|Song|"digital\u00A0download,\u00A0streaming"|2020-01-01|';
    const result = parseMusicContracts(input);
    expect(result[0].usages).toEqual(['digital download', 'streaming']);
  });
});
