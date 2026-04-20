import { useCallback, useMemo, useState } from 'react';
import type { FilteredContract, MusicContract, PartnerContract, SearchParams } from '../../types';
import { filterContracts } from '../../engine/filterContracts';
import { parseMusicContracts } from '../../parsers/parseMusicContracts';
import { parsePartnerContracts } from '../../parsers/parsePartnerContracts';
import { FileUpload } from '../FileUpload/FileUpload';
import { ResultsGrid } from '../ResultsGrid/ResultsGrid';
import { SearchPanel } from '../SearchPanel/SearchPanel';
import { PageHeader, Section } from '../shared';

/** Root application component that orchestrates file upload, search, and results. */
export function App() {
  const [musicContracts, setMusicContracts] = useState<MusicContract[]>([]);
  const [partnerContracts, setPartnerContracts] = useState<PartnerContract[]>([]);
  const [results, setResults] = useState<FilteredContract[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Search form state lifted here so values survive child remounts.
  const [selectedPartner, setSelectedPartner] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');

  const partnerNames = useMemo(
    () => [...new Set(partnerContracts.map((p) => p.partner))],
    [partnerContracts],
  );
  const filesLoaded = musicContracts.length > 0 && partnerContracts.length > 0;

  const handleMusicLoaded = useCallback((text: string) => {
    setMusicContracts(parseMusicContracts(text));
    setHasSearched(false);
  }, []);

  const handlePartnerLoaded = useCallback((text: string) => {
    setPartnerContracts(parsePartnerContracts(text));
    setHasSearched(false);
    setSelectedPartner('');
  }, []);

  const handleSearch = useCallback(
    (params: SearchParams) => {
      setResults(filterContracts(musicContracts, partnerContracts, params));
      setHasSearched(true);
    },
    [musicContracts, partnerContracts],
  );

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>
      <main
        id="main-content"
        className="mx-auto max-w-4xl px-6 py-10 font-sans text-slate-700 antialiased"
      >
        <PageHeader
          title="Global Rights Management"
          subtitle="Determine available music products for distribution partners"
        />

        <Section heading="1. Upload Reference Data">
          <FileUpload
            onMusicContractsLoaded={handleMusicLoaded}
            onPartnerContractsLoaded={handlePartnerLoaded}
          />
          {filesLoaded && (
            <p role="status" className="mt-3 text-sm font-medium text-emerald-700">
              <span aria-hidden="true">✓ </span>
              {musicContracts.length} music contracts &amp; {partnerNames.length} partners loaded
            </p>
          )}
        </Section>

        <Section heading="2. Search Contracts">
          <SearchPanel
            partnerNames={partnerNames}
            selectedPartner={selectedPartner}
            effectiveDate={effectiveDate}
            onPartnerChange={setSelectedPartner}
            onDateChange={setEffectiveDate}
            onSearch={handleSearch}
            disabled={!filesLoaded}
          />
        </Section>

        <Section heading="3. Results">
          <ResultsGrid results={results} hasSearched={hasSearched} />
        </Section>
      </main>
    </>
  );
}
