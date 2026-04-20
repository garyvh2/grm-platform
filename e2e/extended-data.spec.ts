import { test, expect } from '@playwright/test';
import path from 'path';

const EXT_MUSIC = path.resolve('public/data/extended-music.txt');
const EXT_PARTNERS = path.resolve('public/data/extended-partners.txt');

async function uploadFiles(
  page: import('@playwright/test').Page,
  music: string,
  partners: string,
) {
  const inputs = page.locator('input[type="file"]');
  await inputs.nth(0).setInputFiles(music);
  await inputs.nth(1).setInputFiles(partners);
  await expect(page.getByText(/music contracts.*partners loaded/i)).toBeVisible();
}

async function search(page: import('@playwright/test').Page, partner: string, date: string) {
  await page.getByRole('combobox').selectOption(partner);
  await page.getByLabel('Effective Date').fill(date);
  await page.getByRole('button', { name: 'Search' }).click();
}

async function readRows(page: import('@playwright/test').Page) {
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
// Extended dataset: Spotify (streaming only)
// ---------------------------------------------------------------------------
test('Extended: Spotify 2020-07-01 — streaming contracts', async ({ page }) => {
  await page.goto('/');
  await uploadFiles(page, EXT_MUSIC, EXT_PARTNERS);
  await search(page, 'Spotify', '2020-07-01');

  expect(await readRows(page)).toEqual([
    { artist: 'Alpha Band', title: 'First Light', usages: 'streaming', startDate: '2020-01-01', endDate: '' },
    { artist: 'Alpha Band', title: 'Sunset Groove', usages: 'streaming', startDate: '2020-06-15', endDate: '2020-12-31' },
  ]);
});

// ---------------------------------------------------------------------------
// Extended dataset: AmazonMusic (digital download only)
// ---------------------------------------------------------------------------
test('Extended: AmazonMusic 2021-03-01 — digital download contracts', async ({ page }) => {
  await page.goto('/');
  await uploadFiles(page, EXT_MUSIC, EXT_PARTNERS);
  await search(page, 'AmazonMusic', '2021-03-01');

  expect(await readRows(page)).toEqual([
    { artist: 'Alpha Band', title: 'First Light', usages: 'digital download', startDate: '2020-01-01', endDate: '' },
    { artist: 'Beta Crew', title: 'Night Sky', usages: 'digital download', startDate: '2021-01-01', endDate: '' },
    { artist: 'Beta Crew', title: 'Ocean Drive', usages: 'digital download', startDate: '2019-03-01', endDate: '2021-06-30' },
  ]);
});

// ---------------------------------------------------------------------------
// Extended dataset: MegaStream (both usages) — multi-usage rows
// ---------------------------------------------------------------------------
test('Extended: MegaStream 2020-08-01 — multi-usage partner produces multiple rows per contract', async ({ page }) => {
  await page.goto('/');
  await uploadFiles(page, EXT_MUSIC, EXT_PARTNERS);
  await search(page, 'MegaStream', '2020-08-01');

  expect(await readRows(page)).toEqual([
    { artist: 'Alpha Band', title: 'First Light', usages: 'digital download', startDate: '2020-01-01', endDate: '' },
    { artist: 'Alpha Band', title: 'First Light', usages: 'streaming', startDate: '2020-01-01', endDate: '' },
    { artist: 'Alpha Band', title: 'Sunset Groove', usages: 'streaming', startDate: '2020-06-15', endDate: '2020-12-31' },
    { artist: 'Beta Crew', title: 'Ocean Drive', usages: 'digital download', startDate: '2019-03-01', endDate: '2021-06-30' },
  ]);
});

// ---------------------------------------------------------------------------
// Extended: contract not yet started is excluded
// ---------------------------------------------------------------------------
test('Extended: Spotify 2020-06-14 — Sunset Groove not yet started', async ({ page }) => {
  await page.goto('/');
  await uploadFiles(page, EXT_MUSIC, EXT_PARTNERS);
  // One day before Sunset Groove's start date
  await search(page, 'Spotify', '2020-06-14');

  expect(await readRows(page)).toEqual([
    { artist: 'Alpha Band', title: 'First Light', usages: 'streaming', startDate: '2020-01-01', endDate: '' },
  ]);
});

// ---------------------------------------------------------------------------
// Boundary: exact start date is inclusive
// ---------------------------------------------------------------------------
test('Extended: Spotify on exact start date 2020-06-15 — Sunset Groove included', async ({ page }) => {
  await page.goto('/');
  await uploadFiles(page, EXT_MUSIC, EXT_PARTNERS);
  await search(page, 'Spotify', '2020-06-15');

  const rows = await readRows(page);
  expect(rows).toHaveLength(2);
  expect(rows[1]).toMatchObject({ title: 'Sunset Groove', startDate: '2020-06-15' });
});

// ---------------------------------------------------------------------------
// Boundary: exact end date is inclusive
// ---------------------------------------------------------------------------
test('Extended: Spotify on exact end date 2020-12-31 — Sunset Groove still active', async ({ page }) => {
  await page.goto('/');
  await uploadFiles(page, EXT_MUSIC, EXT_PARTNERS);
  await search(page, 'Spotify', '2020-12-31');

  const rows = await readRows(page);
  expect(rows).toHaveLength(2);
  expect(rows[1]).toMatchObject({ title: 'Sunset Groove', endDate: '2020-12-31' });
});

// ---------------------------------------------------------------------------
// Boundary: one day after end date — expired contract excluded
// ---------------------------------------------------------------------------
test('Extended: Spotify 2021-01-01 — Sunset Groove expired, Night Sky now active', async ({ page }) => {
  await page.goto('/');
  await uploadFiles(page, EXT_MUSIC, EXT_PARTNERS);
  await search(page, 'Spotify', '2021-01-01');

  expect(await readRows(page)).toEqual([
    { artist: 'Alpha Band', title: 'First Light', usages: 'streaming', startDate: '2020-01-01', endDate: '' },
    { artist: 'Beta Crew', title: 'Night Sky', usages: 'streaming', startDate: '2021-01-01', endDate: '' },
  ]);
});

// ---------------------------------------------------------------------------
// Boundary: short-lived contract (Gamma Solo, May 2022 only)
// ---------------------------------------------------------------------------
test('Extended: AmazonMusic 2022-05-15 — One Hit Wonder active within its window', async ({ page }) => {
  await page.goto('/');
  await uploadFiles(page, EXT_MUSIC, EXT_PARTNERS);
  await search(page, 'AmazonMusic', '2022-05-15');

  const rows = await readRows(page);
  const gammaRow = rows.find((r) => r.artist === 'Gamma Solo');
  expect(gammaRow).toEqual({
    artist: 'Gamma Solo',
    title: 'One Hit Wonder',
    usages: 'digital download',
    startDate: '2022-05-01',
    endDate: '2022-05-31',
  });
});

test('Extended: AmazonMusic 2022-06-01 — One Hit Wonder expired', async ({ page }) => {
  await page.goto('/');
  await uploadFiles(page, EXT_MUSIC, EXT_PARTNERS);
  await search(page, 'AmazonMusic', '2022-06-01');

  const rows = await readRows(page);
  expect(rows.find((r) => r.artist === 'Gamma Solo')).toBeUndefined();
});
