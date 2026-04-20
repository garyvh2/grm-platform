/** A single music contract linking an artist's title to usage rights. */
export interface MusicContract {
  artist: string;
  title: string;
  usages: string[];
  startDate: string;
  /** Null indicates a perpetual (open-ended) contract. */
  endDate: string | null;
}

/** A mapping from a distribution partner to a licensed usage type. */
export interface PartnerContract {
  partner: string;
  usage: string;
}

/** A single result row produced by the contract filter engine. */
export interface FilteredContract {
  artist: string;
  title: string;
  /** The single matched usage type for this result row. */
  usages: string;
  startDate: string;
  /** Empty string indicates a perpetual (open-ended) contract. */
  endDate: string;
}

/** Parameters for searching active contracts. */
export interface SearchParams {
  partnerName: string;
  /** YYYY-MM-DD date string used for date-range matching. */
  effectiveDate: string;
}
