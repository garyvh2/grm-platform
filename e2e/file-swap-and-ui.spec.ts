import { expect, test } from '@playwright/test';
import path from 'path';

const REF_MUSIC = path.resolve('public/data/music-contracts.txt');
const REF_PARTNERS = path.resolve('public/data/partner-contracts.txt');
const EXT_MUSIC = path.resolve('public/data/extended-music.txt');
const EXT_PARTNERS = path.resolve('public/data/extended-partners.txt');
const MIN_MUSIC = path.resolve('public/data/minimal-music.txt');

async function search(page: import('@playwright/test').Page, partner: string, date: string) {
  await page.getByRole('combobox').selectOption(partner);
  await page.getByLabel('Effective Date').fill(date);
  await page.getByRole('button', { name: 'Search' }).click();
}

// ---------------------------------------------------------------------------
// Re-upload music file replaces old data
// ---------------------------------------------------------------------------
test('Re-upload: replacing music file updates search results', async ({ page }) => {
  await page.goto('/');
  const inputs = page.locator('input[type="file"]');

  // Upload reference data and search
  await inputs.nth(0).setInputFiles(REF_MUSIC);
  await inputs.nth(1).setInputFiles(REF_PARTNERS);
  await expect(page.getByText(/music contracts.*partners loaded/i)).toBeVisible();
  await search(page, 'ITunes', '2012-03-01');
  await expect(page.locator('tbody tr')).toHaveCount(4);

  // Now re-upload a DIFFERENT music file (minimal — 1 contract, digital download only)
  await inputs.nth(0).setInputFiles(MIN_MUSIC);
  // Partner file should still be loaded — search with same partner
  await expect(page.getByText(/music contracts.*partners loaded/i)).toBeVisible();

  // Search ITunes with a date BEFORE the minimal contract starts — should be empty
  await search(page, 'ITunes', '2023-01-01');
  await expect(page.getByText('No matching contracts found')).toBeVisible();

  // Search ITunes with a date AFTER the minimal contract starts — should find 1
  await search(page, 'ITunes', '2023-02-01');
  await expect(page.locator('tbody tr')).toHaveCount(1);
});

// ---------------------------------------------------------------------------
// Re-upload partner file replaces old partner list
// ---------------------------------------------------------------------------
test('Re-upload: replacing partner file updates dropdown options', async ({ page }) => {
  await page.goto('/');
  const inputs = page.locator('input[type="file"]');

  // Upload reference data — partners are ITunes and YouTube
  await inputs.nth(0).setInputFiles(REF_MUSIC);
  await inputs.nth(1).setInputFiles(REF_PARTNERS);
  const combo = page.getByRole('combobox');
  await expect(combo.locator('option')).toHaveCount(3); // "Select partner..." + 2

  // Re-upload extended partners — Spotify, AmazonMusic, MegaStream
  await inputs.nth(1).setInputFiles(EXT_PARTNERS);
  await expect(combo.locator('option')).toHaveCount(4); // "Select partner..." + 3

  // ITunes should no longer be available
  await expect(combo.locator('option', { hasText: 'ITunes' })).toHaveCount(0);
  // Spotify should now be available
  await expect(combo.locator('option', { hasText: 'Spotify' })).toHaveCount(1);
});

// ---------------------------------------------------------------------------
// Swap both files entirely — new dataset works
// ---------------------------------------------------------------------------
test('Re-upload: swap both files to extended dataset and search', async ({ page }) => {
  await page.goto('/');
  const inputs = page.locator('input[type="file"]');

  // Start with reference data
  await inputs.nth(0).setInputFiles(REF_MUSIC);
  await inputs.nth(1).setInputFiles(REF_PARTNERS);
  await search(page, 'YouTube', '2012-04-01');
  await expect(page.locator('tbody tr')).toHaveCount(2);

  // Swap to extended data
  await inputs.nth(0).setInputFiles(EXT_MUSIC);
  await inputs.nth(1).setInputFiles(EXT_PARTNERS);
  await search(page, 'MegaStream', '2020-08-01');
  await expect(page.locator('tbody tr')).toHaveCount(4);
});

// ---------------------------------------------------------------------------
// Header and layout always visible
// ---------------------------------------------------------------------------
test('UI: header and section headings always visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Global Rights Management' })).toBeVisible();
  await expect(page.getByText('1. Upload Reference Data')).toBeVisible();
  await expect(page.getByText('2. Search Contracts')).toBeVisible();
  await expect(page.getByText('3. Results')).toBeVisible();
});

// ---------------------------------------------------------------------------
// Partner dropdown empty before file upload
// ---------------------------------------------------------------------------
test('UI: partner dropdown has only placeholder before upload', async ({ page }) => {
  await page.goto('/');
  const combo = page.getByRole('combobox');
  await expect(combo.locator('option')).toHaveCount(1); // Only "Select partner..."
});

// ---------------------------------------------------------------------------
// Multiple searches without re-uploading
// ---------------------------------------------------------------------------
test('Workflow: multiple sequential searches with same data', async ({ page }) => {
  await page.goto('/');
  const inputs = page.locator('input[type="file"]');
  await inputs.nth(0).setInputFiles(REF_MUSIC);
  await inputs.nth(1).setInputFiles(REF_PARTNERS);

  // First search
  await search(page, 'ITunes', '2012-03-01');
  await expect(page.locator('tbody tr')).toHaveCount(4);

  // Second search — different partner
  await search(page, 'YouTube', '2012-12-27');
  await expect(page.locator('tbody tr')).toHaveCount(4);

  // Third search — fewer results
  await search(page, 'YouTube', '2012-04-01');
  await expect(page.locator('tbody tr')).toHaveCount(2);

  // Fourth search — no results
  await search(page, 'ITunes', '2000-01-01');
  await expect(page.getByText('No matching contracts found')).toBeVisible();
  await expect(page.locator('tbody tr')).toHaveCount(0);
});
