import { test, expect } from '@playwright/test';
import path from 'path';

const MIN_MUSIC = path.resolve('public/data/minimal-music.txt');
const MIN_PARTNERS = path.resolve('public/data/minimal-partners.txt');
const EXP_MUSIC = path.resolve('public/data/expired-music.txt');
const EXP_PARTNERS = path.resolve('public/data/expired-partners.txt');

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
// Minimal dataset: single contract, single partner
// ---------------------------------------------------------------------------
test('Minimal: SingleStore 2023-02-01 — single matching result', async ({ page }) => {
  await page.goto('/');
  await uploadFiles(page, MIN_MUSIC, MIN_PARTNERS);
  await search(page, 'SingleStore', '2023-02-01');

  expect(await readRows(page)).toEqual([
    { artist: 'Solo Artist', title: 'Only Track', usages: 'digital download', startDate: '2023-01-15', endDate: '' },
  ]);
});

// ---------------------------------------------------------------------------
// Minimal: search before contract starts — no results
// ---------------------------------------------------------------------------
test('Minimal: SingleStore 2023-01-01 — before start date, no results', async ({ page }) => {
  await page.goto('/');
  await uploadFiles(page, MIN_MUSIC, MIN_PARTNERS);
  await search(page, 'SingleStore', '2023-01-01');

  await expect(page.getByText('No matching contracts found')).toBeVisible();
});

// ---------------------------------------------------------------------------
// Minimal: search on exact start date — inclusive
// ---------------------------------------------------------------------------
test('Minimal: SingleStore on exact start date 2023-01-15 — included', async ({ page }) => {
  await page.goto('/');
  await uploadFiles(page, MIN_MUSIC, MIN_PARTNERS);
  await search(page, 'SingleStore', '2023-01-15');

  expect(await readRows(page)).toHaveLength(1);
});

// ---------------------------------------------------------------------------
// Expired dataset: all contracts ended — no results
// ---------------------------------------------------------------------------
test('Expired: ArchiveHub 2010-01-01 — all contracts ended, no results', async ({ page }) => {
  await page.goto('/');
  await uploadFiles(page, EXP_MUSIC, EXP_PARTNERS);
  await search(page, 'ArchiveHub', '2010-01-01');

  await expect(page.getByText('No matching contracts found')).toBeVisible();
});

// ---------------------------------------------------------------------------
// Expired: search within a short-lived window
// ---------------------------------------------------------------------------
test('Expired: ArchiveHub 2005-12-25 — Holiday Hit active within window', async ({ page }) => {
  await page.goto('/');
  await uploadFiles(page, EXP_MUSIC, EXP_PARTNERS);
  await search(page, 'ArchiveHub', '2005-12-25');

  expect(await readRows(page)).toEqual([
    { artist: 'Retro Band', title: 'Holiday Hit', usages: 'digital download', startDate: '2005-12-01', endDate: '2006-01-15' },
    { artist: 'Retro Band', title: 'Holiday Hit', usages: 'streaming', startDate: '2005-12-01', endDate: '2006-01-15' },
  ]);
});

// ---------------------------------------------------------------------------
// Expired: search one day after end date — gone
// ---------------------------------------------------------------------------
test('Expired: ArchiveHub 2006-01-16 — Holiday Hit just expired', async ({ page }) => {
  await page.goto('/');
  await uploadFiles(page, EXP_MUSIC, EXP_PARTNERS);
  await search(page, 'ArchiveHub', '2006-01-16');

  await expect(page.getByText('No matching contracts found')).toBeVisible();
});
