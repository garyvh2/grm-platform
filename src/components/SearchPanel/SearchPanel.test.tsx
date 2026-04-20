import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchPanel } from './SearchPanel';

const defaultProps = {
  partnerNames: ['ITunes', 'YouTube'],
  selectedPartner: '',
  effectiveDate: '',
  onPartnerChange: vi.fn(),
  onDateChange: vi.fn(),
  onSearch: vi.fn(),
};

describe('SearchPanel', () => {
  it('renders partner dropdown populated from partner names', () => {
    render(<SearchPanel {...defaultProps} />);
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(3); // default + 2 partners
    expect(screen.getByText('ITunes')).toBeInTheDocument();
    expect(screen.getByText('YouTube')).toBeInTheDocument();
  });

  it('renders date input and search button', () => {
    render(<SearchPanel {...defaultProps} partnerNames={['ITunes']} />);
    expect(screen.getByLabelText(/effective date/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('search button is disabled when partner not selected', () => {
    render(<SearchPanel {...defaultProps} partnerNames={['ITunes']} />);
    expect(screen.getByRole('button', { name: /search/i })).toBeDisabled();
  });

  it('calls onSearch with correct params on submit', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(
      <SearchPanel
        {...defaultProps}
        selectedPartner="ITunes"
        effectiveDate="2024-01-15"
        onSearch={onSearch}
      />,
    );

    await user.click(screen.getByRole('button', { name: /search/i }));

    expect(onSearch).toHaveBeenCalledWith({
      partnerName: 'ITunes',
      effectiveDate: '2024-01-15',
    });
  });

  it('calls onPartnerChange when partner is selected', async () => {
    const user = userEvent.setup();
    const onPartnerChange = vi.fn();
    render(<SearchPanel {...defaultProps} onPartnerChange={onPartnerChange} />);

    await user.selectOptions(screen.getByRole('combobox'), 'YouTube');
    expect(onPartnerChange).toHaveBeenCalledWith('YouTube');
  });

  it('calls onDateChange when date is entered', async () => {
    const user = userEvent.setup();
    const onDateChange = vi.fn();
    render(<SearchPanel {...defaultProps} onDateChange={onDateChange} />);

    await user.type(screen.getByLabelText(/effective date/i), '2024-01-15');
    expect(onDateChange).toHaveBeenCalled();
  });
});
