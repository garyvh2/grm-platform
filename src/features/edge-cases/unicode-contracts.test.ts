import { readFileSync } from 'fs';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { resolve } from 'path';
import { filterContracts } from '../../engine/filterContracts';
import { parseMusicContracts } from '../../parsers/parseMusicContracts';
import { parsePartnerContracts } from '../../parsers/parsePartnerContracts';
import type { FilteredContract, MusicContract, PartnerContract } from '../../types';

const feature = loadFeature(resolve(__dirname, 'unicode-contracts.feature'));

interface GherkinRow {
  Artist: string;
  Title: string;
  Usages: string;
  StartDate: string;
  EndDate: string;
}

type StepFn = (expression: string | RegExp, callback: (...args: string[]) => void) => void;

type TableStepFn = (expression: string, callback: (table: GherkinRow[]) => void) => void;

defineFeature(feature, (test) => {
  let musicContracts: MusicContract[];
  let partnerContracts: PartnerContract[];
  let results: FilteredContract[];

  const givenUnicodeData = (given: StepFn) => {
    given('the unicode reference data', () => {
      const musicText = readFileSync(
        resolve(__dirname, '../../../public/data/unicode-music.txt'),
        'utf-8',
      );
      const partnerText = readFileSync(
        resolve(__dirname, '../../../public/data/unicode-partners.txt'),
        'utf-8',
      );
      musicContracts = parseMusicContracts(musicText);
      partnerContracts = parsePartnerContracts(partnerText);
    });
  };

  const whenUserPerformSearch = (when: StepFn) => {
    when(/^user perform search by "(.*)" "(.*)"$/, (partner: string, date: string) => {
      results = filterContracts(musicContracts, partnerContracts, {
        partnerName: partner,
        effectiveDate: date,
      });
    });
  };

  const thenOutputShouldBe = (then: TableStepFn) => {
    then('the output should be', (table: GherkinRow[]) => {
      expect(results).toHaveLength(table.length);

      results.forEach((row, i) => {
        expect(row.artist).toBe(table[i].Artist);
        expect(row.title).toBe(table[i].Title);
        expect(row.usages).toBe(table[i].Usages);
        expect(row.startDate).toBe(table[i].StartDate);
        expect(row.endDate).toBe(table[i].EndDate ?? '');
      });
    });
  };

  test('Multi-usage partner sees all unicode contracts', ({ given, when, then }) => {
    givenUnicodeData(given);
    whenUserPerformSearch(when);
    thenOutputShouldBe(then);
  });

  test('Streaming-only partner filters to streaming usage', ({ given, when, then }) => {
    givenUnicodeData(given);
    whenUserPerformSearch(when);
    thenOutputShouldBe(then);
  });

  test('Expired bounded contract excluded for unicode data', ({ given, when, then }) => {
    givenUnicodeData(given);
    whenUserPerformSearch(when);
    thenOutputShouldBe(then);
  });
});
