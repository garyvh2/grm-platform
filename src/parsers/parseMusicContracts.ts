import type { MusicContract } from '../types';
import { parseLines } from './parseLines';
import { sanitizeField } from './sanitizeField';

const MIN_FIELDS = 4;

/** Matches a valid `YYYY-MM-DD` date string. */
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Normalizes a raw date string to `YYYY-MM-DD` format.
 *
 * Handles:
 * - ISO datetime suffixes (`2012-01-01T00:00:00Z` → `2012-01-01`)
 * - Slash separators (`2012/01/01` → `2012-01-01`)
 * - Internal whitespace (`2012 - 01 - 01` → `2012-01-01`)
 * - Empty/whitespace-only → `null`
 * - Invalid formats → `null`
 */
function normalizeDate(raw: string): string | null {
  const value = sanitizeField(raw).replace(/\s/g, '').replace(/\//g, '-');
  if (!value) return null;

  // Strip ISO timestamp suffix (e.g., T00:00:00Z)
  const dateOnly = value.length > 10 && value[10] === 'T' ? value.slice(0, 10) : value;

  return DATE_RE.test(dateOnly) ? dateOnly : null;
}

/**
 * Parses pipe-delimited music contract text into structured objects.
 *
 * Expected format: `Artist|Title|Usages|StartDate|EndDate` (header row is
 * skipped). Rows with fewer than 4 fields, missing required values, or
 * invalid date formats are silently discarded.
 *
 * Resilient to: BOM, NUL bytes, mixed line endings, zero-width characters,
 * non-breaking spaces, wrapping quotes, ISO datetime suffixes, slash dates,
 * and control characters in field values.
 */
export function parseMusicContracts(text: string): MusicContract[] {
  return parseLines(text)
    .slice(1)
    .flatMap((line) => {
      const fields = line.split('|').map(sanitizeField);
      if (fields.length < MIN_FIELDS || !fields[0] || !fields[1]) {
        return [];
      }

      const startDate = normalizeDate(fields[3]);
      if (!startDate) return [];

      const usages = fields[2].split(',').map(sanitizeField).filter(Boolean);

      if (!usages.length) return [];

      const endDate = fields[4] !== undefined ? normalizeDate(fields[4]) : null;
      return [{ artist: fields[0], title: fields[1], usages, startDate, endDate }];
    });
}
