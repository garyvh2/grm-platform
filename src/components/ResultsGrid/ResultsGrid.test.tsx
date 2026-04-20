import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultsGrid } from './ResultsGrid';
import type { FilteredContract } from '../../types';

const sampleData: FilteredContract[] = [
  {
    artist: 'Artist A',
    title: 'Song A',
    usages: 'digital',
    startDate: '2020-01-01',
    endDate: '2025-01-01',
  },
  {
    artist: 'Artist B',
    title: 'Song B',
    usages: 'sync, mechanical',
    startDate: '2019-06-15',
    endDate: '',
  },
];

describe('ResultsGrid', () => {
  it('renders table headers', () => {
    render(<ResultsGrid results={sampleData} hasSearched={true} />);
    expect(screen.getByText('Artist')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Usages')).toBeInTheDocument();
    expect(screen.getByText('Start Date')).toBeInTheDocument();
    expect(screen.getByText('End Date')).toBeInTheDocument();
  });

  it('renders correct rows from data', () => {
    render(<ResultsGrid results={sampleData} hasSearched={true} />);
    expect(screen.getByText('Artist A')).toBeInTheDocument();
    expect(screen.getByText('Song A')).toBeInTheDocument();
    expect(screen.getByText('digital')).toBeInTheDocument();
    expect(screen.getByText('2020-01-01')).toBeInTheDocument();
    expect(screen.getByText('2025-01-01')).toBeInTheDocument();
    expect(screen.getByText('Artist B')).toBeInTheDocument();
    expect(screen.getByText('Song B')).toBeInTheDocument();
    expect(screen.getByText('sync, mechanical')).toBeInTheDocument();
  });

  it('announces result count to screen readers', () => {
    render(<ResultsGrid results={sampleData} hasSearched={true} />);
    expect(screen.getByText('2 contracts found')).toBeInTheDocument();
  });

  it('table has accessible caption', () => {
    render(<ResultsGrid results={sampleData} hasSearched={true} />);
    const table = screen.getByRole('table');
    expect(table.querySelector('caption')).not.toBeNull();
  });

  it('column headers have scope attribute', () => {
    render(<ResultsGrid results={sampleData} hasSearched={true} />);
    const headers = screen.getAllByRole('columnheader');
    headers.forEach((th) => expect(th).toHaveAttribute('scope', 'col'));
  });

  it("shows 'No matching contracts found' when results empty and hasSearched is true", () => {
    render(<ResultsGrid results={[]} hasSearched={true} />);
    expect(screen.getByText('No matching contracts found')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('renders live region container when hasSearched is false', () => {
    render(<ResultsGrid results={[]} hasSearched={false} />);
    const region = screen.getByRole('region', { name: /search results/i });
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute('aria-live', 'polite');
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByText('No matching contracts found')).not.toBeInTheDocument();
  });
});
