import { readFileSync } from 'fs';
import { defineFeature, loadFeature } from 'jest-cucumber';
import { resolve } from 'path';
import { filterContracts } from '../../engine/filterContracts';
import { parseMusicContracts } from '../../parsers/parseMusicContracts';
import { parsePartnerContracts } from '../../parsers/parsePartnerContracts';
import type { FilteredContract, MusicContract, PartnerContract } from '../../types';

const feature = loadFeature(resolve(__dirname, 'boundary-contracts.feature'));

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

  const givenBoundaryData = (given: StepFn) => {
    given('the boundary reference data', () => {
      const musicText = readFileSync(
        resolve(__dirname, '../../../public/data/boundary-music.txt'),
        'utf-8',
      );
      const partnerText = readFileSync(
        resolve(__dirname, '../../../public/data/boundary-partners.txt'),
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

  test('All-access partner on exact boundary date', ({ given, when, then }) => {
    givenBoundaryData(given);
    whenUserPerformSearch(when);
    thenOutputShouldBe(then);
  });

  test('Download-only partner filters out streaming contracts', ({ given, when, then }) => {
    givenBoundaryData(given);
    whenUserPerformSearch(when);
    thenOutputShouldBe(then);
  });

  test('Day after boundary excludes same-day and ended-today contracts', ({
    given,
    when,
    then,
  }) => {
    givenBoundaryData(given);
    whenUserPerformSearch(when);
    thenOutputShouldBe(then);
  });
});
