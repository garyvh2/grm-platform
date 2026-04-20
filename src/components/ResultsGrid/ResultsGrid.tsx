import { memo } from 'react';
import type { FilteredContract } from '../../types';
import { Badge, EmptyState } from '../shared';

interface ResultsGridProps {
  results: FilteredContract[];
  hasSearched: boolean;
}

/**
 * Displays filtered contract results in a tabular format.
 *
 * Wrapped in `React.memo` — skips re-rendering when sibling state changes
 * (e.g., file uploads) don't affect `results` or `hasSearched`.
 */
export const ResultsGrid = memo(function ResultsGrid({ results, hasSearched }: ResultsGridProps) {
  return (
    <div role="region" aria-live="polite" aria-label="Search results">
      {hasSearched && results.length === 0 && <EmptyState message="No matching contracts found" />}
      {hasSearched && results.length > 0 && (
        <>
          <p className="sr-only">{results.length} contracts found</p>
          <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
            <table className="w-full text-left text-sm">
              <caption className="sr-only">
                Active music contracts matching the search criteria
              </caption>
              <thead>
                <tr className="bg-slate-800 text-xs tracking-wider text-slate-200 uppercase">
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Artist
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Title
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Usages
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Start Date
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    End Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((row, index) => (
                  <tr
                    key={index}
                    className="text-slate-600 transition even:bg-slate-50 hover:bg-indigo-50"
                  >
                    <td className="px-4 py-2.5 font-medium text-slate-800">{row.artist}</td>
                    <td className="px-4 py-2.5">{row.title}</td>
                    <td className="px-4 py-2.5">
                      <Badge>{row.usages}</Badge>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">{row.startDate}</td>
                    <td className="px-4 py-2.5 font-mono text-xs">{row.endDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
});
