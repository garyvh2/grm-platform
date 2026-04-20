import { test, expect } from '@playwright/test';
import path from 'path';

const MUSIC_FILE = path.resolve('public/data/music-contracts.txt');
const PARTNER_FILE = path.resolve('public/data/partner-contracts.txt');

/** Upload both reference data files and verify both remain loaded. */
async function uploadBothFiles(page: import('@playwright/test').Page) {
  const fileInputs = page.locator('input[type="file"]');

  // Upload music contracts (first input)
  await fileInputs.nth(0).setInputFiles(MUSIC_FILE);
  // Upload partner contracts (second input)
  await fileInputs.nth(1).setInputFiles(PARTNER_FILE);

  // Both files must remain loaded — regression: uploading the second file
  // must NOT unload the first.
  await expect(page.getByText('music-contracts.txt')).toBeVisible();
  await expect(page.getByText('partner-contracts.txt')).toBeVisible();
  await expect(page.getByText(/music contracts.*partners loaded/i)).toBeVisible();
}

/** Select a partner and date, then click Search. */
async function performSearch(
  page: import('@playwright/test').Page,
  partner: string,
  date: string,
) {
  await page.getByRole('combobox').selectOption(partner);
  await page.getByLabel('Effective Date').fill(date);
  await page.getByRole('button', { name: 'Search' }).click();
}

/** Read the results table rows (excluding header) as structured data. */
async function readResultsTable(page: import('@playwright/test').Page) {
  const rows = page.locator('tbody tr');
  const count = await rows.count();
  const data: { artist: string; title: string; usages: string; startDate: string; endDate: string }[] = [];

  for (let i = 0; i < count; i++) {
    const cells = rows.nth(i).locator('td');
    data.push({
      artist: (await cells.nth(0).textContent()) ?? '',
      title: (await cells.nth(1).textContent()) ?? '',
      usages: (await cells.nth(2).textContent()) ?? '',
      startDate: (await cells.nth(3).textContent()) ?? '',
      endDate: (await cells.nth(4).textContent()) ?? '',
    });
  }
  return data;
}

// ---------------------------------------------------------------------------
// Scenario 1: ITunes 2012-03-01
// ---------------------------------------------------------------------------
test('Scenario 1: Search ITunes 2012-03-01', async ({ page }) => {
  await page.goto('/');
  await uploadBothFiles(page);
  await performSearch(page, 'ITunes', '2012-03-01');

  const results = await readResultsTable(page);
  expect(results).toEqual([
    { artist: 'Monkey Claw', title: 'Black Mountain', usages: 'digital download', startDate: '2012-02-01', endDate: '' },
    { artist: 'Monkey Claw', title: 'Motor Mouth', usages: 'digital download', startDate: '2011-03-01', endDate: '' },
    { artist: 'Tinie Tempah', title: 'Frisky (Live from SoHo)', usages: 'digital download', startDate: '2012-02-01', endDate: '' },
    { artist: 'Tinie Tempah', title: 'Miami 2 Ibiza', usages: 'digital download', startDate: '2012-02-01', endDate: '' },
  ]);
});

// ---------------------------------------------------------------------------
// Scenario 2: YouTube 2012-12-27
// ---------------------------------------------------------------------------
test('Scenario 2: Search YouTube 2012-12-27', async ({ page }) => {
  await page.goto('/');
  await uploadBothFiles(page);
  await performSearch(page, 'YouTube', '2012-12-27');

  const results = await readResultsTable(page);
  expect(results).toEqual([
    { artist: 'Monkey Claw', title: 'Christmas Special', usages: 'streaming', startDate: '2012-12-25', endDate: '2012-12-31' },
    { artist: 'Monkey Claw', title: 'Iron Horse', usages: 'streaming', startDate: '2012-06-01', endDate: '' },
    { artist: 'Monkey Claw', title: 'Motor Mouth', usages: 'streaming', startDate: '2011-03-01', endDate: '' },
    { artist: 'Tinie Tempah', title: 'Frisky (Live from SoHo)', usages: 'streaming', startDate: '2012-02-01', endDate: '' },
  ]);
});

// ---------------------------------------------------------------------------
// Scenario 3: YouTube 2012-04-01
// ---------------------------------------------------------------------------
test('Scenario 3: Search YouTube 2012-04-01', async ({ page }) => {
  await page.goto('/');
  await uploadBothFiles(page);
  await performSearch(page, 'YouTube', '2012-04-01');

  const results = await readResultsTable(page);
  expect(results).toEqual([
    { artist: 'Monkey Claw', title: 'Motor Mouth', usages: 'streaming', startDate: '2011-03-01', endDate: '' },
    { artist: 'Tinie Tempah', title: 'Frisky (Live from SoHo)', usages: 'streaming', startDate: '2012-02-01', endDate: '' },
  ]);
});

// ---------------------------------------------------------------------------
// Regression: Second file upload must not unload the first
// ---------------------------------------------------------------------------
test('Both files remain loaded after sequential uploads', async ({ page }) => {
  await page.goto('/');
  const fileInputs = page.locator('input[type="file"]');

  // Upload music file first
  await fileInputs.nth(0).setInputFiles(MUSIC_FILE);
  await expect(page.getByText('music-contracts.txt')).toBeVisible();

  // Upload partner file second — music file must still be loaded
  await fileInputs.nth(1).setInputFiles(PARTNER_FILE);
  await expect(page.getByText('music-contracts.txt')).toBeVisible();
  await expect(page.getByText('partner-contracts.txt')).toBeVisible();

  // The confirmation message proves BOTH datasets are in memory
  await expect(page.getByText(/music contracts.*partners loaded/i)).toBeVisible();

  // Search must work — proving data from both files is available
  await performSearch(page, 'ITunes', '2012-03-01');
  await expect(page.locator('tbody tr')).toHaveCount(4);
});

// ---------------------------------------------------------------------------
// Reverse upload order also works
// ---------------------------------------------------------------------------
test('Upload partner first, then music — both stay loaded', async ({ page }) => {
  await page.goto('/');
  const fileInputs = page.locator('input[type="file"]');

  // Upload partner file first
  await fileInputs.nth(1).setInputFiles(PARTNER_FILE);
  await expect(page.getByText('partner-contracts.txt')).toBeVisible();

  // Upload music file second — partner file must still be loaded
  await fileInputs.nth(0).setInputFiles(MUSIC_FILE);
  await expect(page.getByText('partner-contracts.txt')).toBeVisible();
  await expect(page.getByText('music-contracts.txt')).toBeVisible();
  await expect(page.getByText(/music contracts.*partners loaded/i)).toBeVisible();
});

// ---------------------------------------------------------------------------
// Search button disabled until both files uploaded
// ---------------------------------------------------------------------------
test('Search button disabled until both files loaded', async ({ page }) => {
  await page.goto('/');
  const searchBtn = page.getByRole('button', { name: 'Search' });
  const fileInputs = page.locator('input[type="file"]');

  // Initially disabled
  await expect(searchBtn).toBeDisabled();

  // After one file — still disabled
  await fileInputs.nth(0).setInputFiles(MUSIC_FILE);
  await expect(searchBtn).toBeDisabled();

  // After both files — enabled
  await fileInputs.nth(1).setInputFiles(PARTNER_FILE);
  await page.getByRole('combobox').selectOption('ITunes');
  await page.getByLabel('Effective Date').fill('2012-03-01');
  await expect(searchBtn).toBeEnabled();
});

// ---------------------------------------------------------------------------
// No results scenario
// ---------------------------------------------------------------------------
test('No matching contracts shows empty message', async ({ page }) => {
  await page.goto('/');
  await uploadBothFiles(page);
  // Search for a date before any contract starts
  await performSearch(page, 'ITunes', '2000-01-01');
  await expect(page.getByText('No matching contracts found')).toBeVisible();
});
