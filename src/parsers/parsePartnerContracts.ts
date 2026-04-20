import type { PartnerContract } from '../types';
import { parseLines } from './parseLines';
import { sanitizeField } from './sanitizeField';

const MIN_FIELDS = 2;

/**
 * Parses pipe-delimited partner contract text into structured objects.
 *
 * Expected format: `Partner|Usage` (header row is skipped). Rows with fewer
 * than 2 fields or missing required values are silently discarded.
 *
 * Resilient to: BOM, NUL bytes, mixed line endings, zero-width characters,
 * non-breaking spaces, wrapping quotes, and control characters in fields.
 */
export function parsePartnerContracts(text: string): PartnerContract[] {
  return parseLines(text)
    .slice(1)
    .flatMap((line) => {
      const fields = line.split('|').map(sanitizeField);
      return fields.length >= MIN_FIELDS && fields[0] && fields[1]
        ? [{ partner: fields[0], usage: fields[1] }]
        : [];
    });
}
