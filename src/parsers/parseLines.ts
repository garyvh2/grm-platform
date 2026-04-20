/** NUL bytes that can sneak in from binary corruption or encoding errors. */
const NUL = /\0/g;

/** BOM / zero-width no-break space (U+FEFF). */
const BOM = /\uFEFF/g;

/**
 * All characters that function as line separators across platforms and Unicode:
 * `\r\n` (Windows), `\r` (old Mac), `\v` (vertical tab), `\f` (form feed),
 * `\u2028` (Line Separator), `\u2029` (Paragraph Separator).
 */
const LINE_SEPARATORS = /\r\n?|[\v\f\u2028\u2029]/g;

/**
 * Normalizes raw file text into non-empty trimmed lines.
 *
 * Resilient to:
 * - BOM (UTF-8/UTF-16 byte order marks)
 * - NUL bytes (binary corruption artifacts)
 * - All line endings: `\r\n`, `\r`, `\n`, `\v`, `\f`, `\u2028`, `\u2029`
 * - Leading/trailing whitespace on every line
 * - Empty and whitespace-only lines
 */
export function parseLines(text: string): string[] {
  return text
    .replace(NUL, '')
    .replace(BOM, '')
    .replace(LINE_SEPARATORS, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
