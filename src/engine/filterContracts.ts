import type { FilteredContract, MusicContract, PartnerContract, SearchParams } from '../types';

/**
 * Filters music contracts against partner usage rights for a given date.
 *
 * The algorithm:
 *
 * 1. Resolves the partner name (case-insensitive) to its licensed usage types.
 * 2. For each music contract, checks whether it has at least one matching
 *    usage and whether the effective date falls within the contract's
 *    `[startDate, endDate]` range (null endDate = perpetual).
 * 3. Produces one result row per matched usage, sorted by artist then title.
 */
export function filterContracts(
  contracts: MusicContract[],
  partners: PartnerContract[],
  { partnerName, effectiveDate }: SearchParams,
): FilteredContract[] {
  const partnerUsages = partners
    .filter((p) => p.partner.toLowerCase() === partnerName.toLowerCase())
    .map((p) => p.usage);

  return contracts
    .flatMap((contract) => {
      const matchedUsages = contract.usages.filter((u) => partnerUsages.includes(u));
      if (!matchedUsages.length) return [];
      if (contract.startDate > effectiveDate) return [];
      if (contract.endDate !== null && contract.endDate < effectiveDate) return [];

      return matchedUsages.map((usage) => ({
        artist: contract.artist,
        title: contract.title,
        usages: usage,
        startDate: contract.startDate,
        endDate: contract.endDate ?? '',
      }));
    })
    .sort((a, b) => a.artist.localeCompare(b.artist) || a.title.localeCompare(b.title));
}
