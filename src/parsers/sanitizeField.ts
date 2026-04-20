/**
 * Invisible Unicode characters: zero-width space/joiner/non-joiner,
 * directional marks, line/paragraph separators, word joiner, and BOM.
 */
const INVISIBLE_CHARS = /[\u200B-\u200F\u2028-\u202F\u2060-\u206F\uFEFF]/g;

/**
 * ASCII control characters except horizontal tab (0x09), line feed (0x0A),
 * and carriage return (0x0D) — those are handled by {@link parseLines}.
 */
// eslint-disable-next-line no-control-regex -- intentional: stripping binary corruption artifacts
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

/** Non-breaking space (U+00A0), common in copy-paste from Word or web. */
const NBSP = /\u00A0/g;

/**
 * Cleans a raw pipe-delimited field value.
 *
 * Handles real-world file issues including:
 * - Zero-width characters (`\u200B`, `\u200C`, `\u200D`)
 * - Directional marks (`\u200E`, `\u200F`)
 * - Non-breaking spaces (`\u00A0` → regular space)
 * - ASCII control characters (backspace, bell, form feed, etc.)
 * - Wrapping straight quotes (`"value"` or `'value'`)
 * - Wrapping smart/curly quotes (`\u201Cvalue\u201D` or `\u2018value\u2019`)
 */
export function sanitizeField(raw: string): string {
  const cleaned = raw
    .replace(INVISIBLE_CHARS, '')
    .replace(CONTROL_CHARS, '')
    .replace(NBSP, ' ')
    .trim();

  return unwrapQuotes(cleaned);
}

/** Strips one layer of matching quotation marks (straight or curly). */
function unwrapQuotes(value: string): string {
  if (value.length < 2) return value;

  const first = value[0];
  const last = value[value.length - 1];

  const isWrapped =
    (first === '"' && last === '"') ||
    (first === "'" && last === "'") ||
    (first === '\u201C' && last === '\u201D') || // " "
    (first === '\u2018' && last === '\u2019'); // ' '

  return isWrapped ? value.slice(1, -1).trim() : value;
}
