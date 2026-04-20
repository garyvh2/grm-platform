import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { App } from './App';

const MUSIC_CONTRACTS = `Artist|Title|Usages|StartDate|EndDate
Tinie Tempah|Frisky (Live from SoHo)|digital download, streaming|2012-02-01|
Tinie Tempah|Miami 2 Ibiza|digital download|2012-02-01|
Tinie Tempah|Till I'm Gone|digital download|2012-08-01|
Monkey Claw|Black Mountain|digital download|2012-02-01|
Monkey Claw|Iron Horse|digital download, streaming|2012-06-01|
Monkey Claw|Motor Mouth|digital download, streaming|2011-03-01|
Monkey Claw|Christmas Special|streaming|2012-12-25|2012-12-31`;

const PARTNER_CONTRACTS = `Partner|Usage
ITunes|digital download
YouTube|streaming`;

function createFile(content: string, name: string): File {
  return new File([content], name, { type: 'text/plain' });
}

async function uploadFiles(user: ReturnType<typeof userEvent.setup>) {
  const fileInputs = screen.getAllByLabelText(/contracts/i);
  const musicInput = fileInputs.find((el) =>
    el.closest('label')?.textContent?.includes('Music'),
  ) as HTMLInputElement;
  const partnerInput = fileInputs.find((el) =>
    el.closest('label')?.textContent?.includes('Partner'),
  ) as HTMLInputElement;

  await user.upload(musicInput, createFile(MUSIC_CONTRACTS, 'music.txt'));
  await user.upload(partnerInput, createFile(PARTNER_CONTRACTS, 'partners.txt'));

  // Wait for async FileReader callbacks to propagate state updates.
  await waitFor(() => {
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThan(1);
  });
}

async function performSearch(
  user: ReturnType<typeof userEvent.setup>,
  partner: string,
  date: string,
) {
  const select = screen.getByRole('combobox');
  await user.selectOptions(select, partner);

  const dateInput = screen.getByLabelText(/effective date/i);
  await user.type(dateInput, date);

  const searchButton = screen.getByRole('button', { name: /search/i });
  await user.click(searchButton);
}

function getTableRows() {
  const table = screen.getByRole('table');
  const rows = within(table).getAllByRole('row');
  return rows.slice(1).map((row) => {
    const cells = within(row).getAllByRole('cell');
    return cells.map((cell) => cell.textContent ?? '');
  });
}

describe('App', () => {
  let user: ReturnType<typeof userEvent.setup>;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('renders the application title', () => {
    render(<App />);
    expect(screen.getByText(/global rights management/i)).toBeInTheDocument();
  });

  it('disables search before files are uploaded', () => {
    render(<App />);
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeDisabled();
  });

  it('enables search after both files are uploaded', async () => {
    render(<App />);
    await uploadFiles(user);

    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'ITunes');

    const dateInput = screen.getByLabelText(/effective date/i);
    await user.type(dateInput, '2012-03-01');

    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeEnabled();
  });

  it('Scenario 1: ITunes 2012-03-01', async () => {
    render(<App />);
    await uploadFiles(user);
    await performSearch(user, 'ITunes', '2012-03-01');

    const rows = getTableRows();
    expect(rows).toEqual([
      ['Monkey Claw', 'Black Mountain', 'digital download', '2012-02-01', ''],
      ['Monkey Claw', 'Motor Mouth', 'digital download', '2011-03-01', ''],
      ['Tinie Tempah', 'Frisky (Live from SoHo)', 'digital download', '2012-02-01', ''],
      ['Tinie Tempah', 'Miami 2 Ibiza', 'digital download', '2012-02-01', ''],
    ]);
  });

  it('Scenario 2: YouTube 2012-12-27', async () => {
    render(<App />);
    await uploadFiles(user);
    await performSearch(user, 'YouTube', '2012-12-27');

    const rows = getTableRows();
    expect(rows).toEqual([
      ['Monkey Claw', 'Christmas Special', 'streaming', '2012-12-25', '2012-12-31'],
      ['Monkey Claw', 'Iron Horse', 'streaming', '2012-06-01', ''],
      ['Monkey Claw', 'Motor Mouth', 'streaming', '2011-03-01', ''],
      ['Tinie Tempah', 'Frisky (Live from SoHo)', 'streaming', '2012-02-01', ''],
    ]);
  });

  it('Scenario 3: YouTube 2012-04-01', async () => {
    render(<App />);
    await uploadFiles(user);
    await performSearch(user, 'YouTube', '2012-04-01');

    const rows = getTableRows();
    expect(rows).toEqual([
      ['Monkey Claw', 'Motor Mouth', 'streaming', '2011-03-01', ''],
      ['Tinie Tempah', 'Frisky (Live from SoHo)', 'streaming', '2012-02-01', ''],
    ]);
  });

  it('shows no results message when no contracts match', async () => {
    render(<App />);
    await uploadFiles(user);
    await performSearch(user, 'ITunes', '2010-01-01');

    expect(screen.getByText(/no matching contracts found/i)).toBeInTheDocument();
  });
});
