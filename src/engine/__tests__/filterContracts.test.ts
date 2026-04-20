import { describe, it, expect } from 'vitest';
import { filterContracts } from '../filterContracts';
import type { MusicContract, PartnerContract } from '../../types';

const musicContracts: MusicContract[] = [
  {
    artist: 'Tinie Tempah',
    title: 'Frisky (Live from SoHo)',
    usages: ['digital download', 'streaming'],
    startDate: '2012-02-01',
    endDate: null,
  },
  {
    artist: 'Tinie Tempah',
    title: 'Miami 2 Ibiza',
    usages: ['digital download'],
    startDate: '2012-02-01',
    endDate: null,
  },
  {
    artist: 'Tinie Tempah',
    title: "Till I'm Gone",
    usages: ['digital download'],
    startDate: '2012-08-01',
    endDate: null,
  },
  {
    artist: 'Monkey Claw',
    title: 'Black Mountain',
    usages: ['digital download'],
    startDate: '2012-02-01',
    endDate: null,
  },
  {
    artist: 'Monkey Claw',
    title: 'Iron Horse',
    usages: ['digital download', 'streaming'],
    startDate: '2012-06-01',
    endDate: null,
  },
  {
    artist: 'Monkey Claw',
    title: 'Motor Mouth',
    usages: ['digital download', 'streaming'],
    startDate: '2011-03-01',
    endDate: null,
  },
  {
    artist: 'Monkey Claw',
    title: 'Christmas Special',
    usages: ['streaming'],
    startDate: '2012-12-25',
    endDate: '2012-12-31',
  },
];

const partnerContracts: PartnerContract[] = [
  { partner: 'ITunes', usage: 'digital download' },
  { partner: 'YouTube', usage: 'streaming' },
];

describe('filterContracts', () => {
  it('AC-1: ITunes on 2012-03-01 returns 4 digital download contracts', () => {
    const result = filterContracts(musicContracts, partnerContracts, {
      partnerName: 'ITunes',
      effectiveDate: '2012-03-01',
    });

    expect(result).toEqual([
      {
        artist: 'Monkey Claw',
        title: 'Black Mountain',
        usages: 'digital download',
        startDate: '2012-02-01',
        endDate: '',
      },
      {
        artist: 'Monkey Claw',
        title: 'Motor Mouth',
        usages: 'digital download',
        startDate: '2011-03-01',
        endDate: '',
      },
      {
        artist: 'Tinie Tempah',
        title: 'Frisky (Live from SoHo)',
        usages: 'digital download',
        startDate: '2012-02-01',
        endDate: '',
      },
      {
        artist: 'Tinie Tempah',
        title: 'Miami 2 Ibiza',
        usages: 'digital download',
        startDate: '2012-02-01',
        endDate: '',
      },
    ]);
  });

  it('AC-2: YouTube on 2012-12-27 returns 4 streaming contracts', () => {
    const result = filterContracts(musicContracts, partnerContracts, {
      partnerName: 'YouTube',
      effectiveDate: '2012-12-27',
    });

    expect(result).toEqual([
      {
        artist: 'Monkey Claw',
        title: 'Christmas Special',
        usages: 'streaming',
        startDate: '2012-12-25',
        endDate: '2012-12-31',
      },
      {
        artist: 'Monkey Claw',
        title: 'Iron Horse',
        usages: 'streaming',
        startDate: '2012-06-01',
        endDate: '',
      },
      {
        artist: 'Monkey Claw',
        title: 'Motor Mouth',
        usages: 'streaming',
        startDate: '2011-03-01',
        endDate: '',
      },
      {
        artist: 'Tinie Tempah',
        title: 'Frisky (Live from SoHo)',
        usages: 'streaming',
        startDate: '2012-02-01',
        endDate: '',
      },
    ]);
  });

  it('AC-3: YouTube on 2012-04-01 returns 2 streaming contracts', () => {
    const result = filterContracts(musicContracts, partnerContracts, {
      partnerName: 'YouTube',
      effectiveDate: '2012-04-01',
    });

    expect(result).toEqual([
      {
        artist: 'Monkey Claw',
        title: 'Motor Mouth',
        usages: 'streaming',
        startDate: '2011-03-01',
        endDate: '',
      },
      {
        artist: 'Tinie Tempah',
        title: 'Frisky (Live from SoHo)',
        usages: 'streaming',
        startDate: '2012-02-01',
        endDate: '',
      },
    ]);
  });

  it('returns empty array when partner not found', () => {
    const result = filterContracts(musicContracts, partnerContracts, {
      partnerName: 'Spotify',
      effectiveDate: '2012-03-01',
    });

    expect(result).toEqual([]);
  });

  it('returns empty array when no contracts match date range', () => {
    const result = filterContracts(musicContracts, partnerContracts, {
      partnerName: 'ITunes',
      effectiveDate: '2010-01-01',
    });

    expect(result).toEqual([]);
  });

  it('excludes contracts where startDate > effectiveDate', () => {
    const result = filterContracts(musicContracts, partnerContracts, {
      partnerName: 'ITunes',
      effectiveDate: '2012-03-01',
    });

    const titles = result.map((c) => c.title);
    expect(titles).not.toContain("Till I'm Gone");
    expect(titles).not.toContain('Iron Horse');
  });

  it('excludes contracts where endDate < effectiveDate', () => {
    const result = filterContracts(musicContracts, partnerContracts, {
      partnerName: 'YouTube',
      effectiveDate: '2013-01-01',
    });

    const titles = result.map((c) => c.title);
    expect(titles).not.toContain('Christmas Special');
  });

  it('includes contracts with null endDate (perpetual)', () => {
    const result = filterContracts(musicContracts, partnerContracts, {
      partnerName: 'ITunes',
      effectiveDate: '2012-03-01',
    });

    expect(result.length).toBeGreaterThan(0);
    const perpetual = result.filter((c) => c.endDate === '');
    expect(perpetual.length).toBe(result.length);
  });

  it('output usages contain only matched partner usages, not all contract usages', () => {
    const result = filterContracts(musicContracts, partnerContracts, {
      partnerName: 'ITunes',
      effectiveDate: '2012-03-01',
    });

    const motorMouth = result.find((c) => c.title === 'Motor Mouth');
    expect(motorMouth).toBeDefined();
    expect(motorMouth!.usages).toBe('digital download');
    expect(motorMouth!.usages).not.toContain('streaming');
  });

  it('results sorted by artist ascending then title ascending', () => {
    const result = filterContracts(musicContracts, partnerContracts, {
      partnerName: 'YouTube',
      effectiveDate: '2012-12-27',
    });

    const artists = result.map((c) => c.artist);
    const sortedArtists = [...artists].sort();
    expect(artists).toEqual(sortedArtists);

    const monkeyClawTitles = result.filter((c) => c.artist === 'Monkey Claw').map((c) => c.title);
    const sortedMonkeyTitles = [...monkeyClawTitles].sort();
    expect(monkeyClawTitles).toEqual(sortedMonkeyTitles);
  });

  it('case-insensitive partner name matching', () => {
    const lower = filterContracts(musicContracts, partnerContracts, {
      partnerName: 'itunes',
      effectiveDate: '2012-03-01',
    });

    const original = filterContracts(musicContracts, partnerContracts, {
      partnerName: 'ITunes',
      effectiveDate: '2012-03-01',
    });

    expect(lower).toEqual(original);
    expect(lower.length).toBe(4);
  });

  it('returns empty array when music contracts array is empty', () => {
    const result = filterContracts([], partnerContracts, {
      partnerName: 'ITunes',
      effectiveDate: '2012-03-01',
    });

    expect(result).toEqual([]);
  });

  it('returns empty array when partner contracts array is empty', () => {
    const result = filterContracts(musicContracts, [], {
      partnerName: 'ITunes',
      effectiveDate: '2012-03-01',
    });

    expect(result).toEqual([]);
  });

  it('includes contract when effectiveDate exactly equals startDate', () => {
    const contracts: MusicContract[] = [
      {
        artist: 'Edge Artist',
        title: 'Boundary Start',
        usages: ['digital download'],
        startDate: '2023-06-15',
        endDate: null,
      },
    ];

    const result = filterContracts(contracts, partnerContracts, {
      partnerName: 'ITunes',
      effectiveDate: '2023-06-15',
    });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Boundary Start');
  });

  it('includes contract when effectiveDate exactly equals endDate', () => {
    const contracts: MusicContract[] = [
      {
        artist: 'Edge Artist',
        title: 'Boundary End',
        usages: ['digital download'],
        startDate: '2023-01-01',
        endDate: '2023-06-15',
      },
    ];

    const result = filterContracts(contracts, partnerContracts, {
      partnerName: 'ITunes',
      effectiveDate: '2023-06-15',
    });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Boundary End');
  });

  it('includes single-day contract when effectiveDate matches', () => {
    const contracts: MusicContract[] = [
      {
        artist: 'Flash Artist',
        title: 'One Day Only',
        usages: ['streaming'],
        startDate: '2023-07-04',
        endDate: '2023-07-04',
      },
    ];

    const result = filterContracts(contracts, partnerContracts, {
      partnerName: 'YouTube',
      effectiveDate: '2023-07-04',
    });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('One Day Only');
  });

  it('excludes single-day contract when effectiveDate is day after', () => {
    const contracts: MusicContract[] = [
      {
        artist: 'Flash Artist',
        title: 'One Day Only',
        usages: ['streaming'],
        startDate: '2023-07-04',
        endDate: '2023-07-04',
      },
    ];

    const result = filterContracts(contracts, partnerContracts, {
      partnerName: 'YouTube',
      effectiveDate: '2023-07-05',
    });

    expect(result).toEqual([]);
  });

  it('returns separate rows when partner has multiple matching usage types', () => {
    const partners: PartnerContract[] = [
      { partner: 'MultiPlatform', usage: 'digital download' },
      { partner: 'MultiPlatform', usage: 'streaming' },
    ];
    const contracts: MusicContract[] = [
      {
        artist: 'Multi Artist',
        title: 'Dual Track',
        usages: ['digital download', 'streaming'],
        startDate: '2023-01-01',
        endDate: null,
      },
    ];

    const result = filterContracts(contracts, partners, {
      partnerName: 'MultiPlatform',
      effectiveDate: '2023-06-01',
    });

    expect(result).toHaveLength(2);
    const usages = result.map((r) => r.usages).sort();
    expect(usages).toEqual(['digital download', 'streaming']);
  });

  it('produces multiple result rows when contract has multiple usages all matching partner', () => {
    const partners: PartnerContract[] = [
      { partner: 'AllAccess', usage: 'digital download' },
      { partner: 'AllAccess', usage: 'streaming' },
    ];
    const contracts: MusicContract[] = [
      {
        artist: 'Full Match',
        title: 'Every Usage',
        usages: ['digital download', 'streaming'],
        startDate: '2022-01-01',
        endDate: null,
      },
    ];

    const result = filterContracts(contracts, partners, {
      partnerName: 'AllAccess',
      effectiveDate: '2023-01-01',
    });

    expect(result).toHaveLength(2);
    expect(result.every((r) => r.artist === 'Full Match')).toBe(true);
    expect(result.every((r) => r.title === 'Every Usage')).toBe(true);
  });

  it('excludes contract when effectiveDate is one day before startDate', () => {
    const contracts: MusicContract[] = [
      {
        artist: 'Future Artist',
        title: 'Not Yet',
        usages: ['digital download'],
        startDate: '2023-06-16',
        endDate: null,
      },
    ];

    const result = filterContracts(contracts, partnerContracts, {
      partnerName: 'ITunes',
      effectiveDate: '2023-06-15',
    });

    expect(result).toEqual([]);
  });

  it('excludes contract when endDate is day before effectiveDate', () => {
    const contracts: MusicContract[] = [
      {
        artist: 'Past Artist',
        title: 'Just Expired',
        usages: ['digital download'],
        startDate: '2023-01-01',
        endDate: '2023-06-14',
      },
    ];

    const result = filterContracts(contracts, partnerContracts, {
      partnerName: 'ITunes',
      effectiveDate: '2023-06-15',
    });

    expect(result).toEqual([]);
  });

  it('returns empty array when all contracts are expired', () => {
    const contracts: MusicContract[] = [
      {
        artist: 'Old Artist A',
        title: 'Expired One',
        usages: ['digital download'],
        startDate: '2020-01-01',
        endDate: '2020-12-31',
      },
      {
        artist: 'Old Artist B',
        title: 'Expired Two',
        usages: ['streaming'],
        startDate: '2019-06-01',
        endDate: '2021-05-31',
      },
    ];

    const result = filterContracts(contracts, partnerContracts, {
      partnerName: 'ITunes',
      effectiveDate: '2023-01-01',
    });

    expect(result).toEqual([]);
  });

  it('returns only the correct subset when some contracts match and some do not', () => {
    const contracts: MusicContract[] = [
      {
        artist: 'Alpha',
        title: 'Active Hit',
        usages: ['digital download'],
        startDate: '2022-01-01',
        endDate: null,
      },
      {
        artist: 'Beta',
        title: 'Future Release',
        usages: ['digital download'],
        startDate: '2025-01-01',
        endDate: null,
      },
      {
        artist: 'Gamma',
        title: 'Expired Song',
        usages: ['digital download'],
        startDate: '2020-01-01',
        endDate: '2021-12-31',
      },
      {
        artist: 'Delta',
        title: 'Wrong Usage',
        usages: ['physical'],
        startDate: '2022-01-01',
        endDate: null,
      },
      {
        artist: 'Epsilon',
        title: 'Also Active',
        usages: ['digital download', 'streaming'],
        startDate: '2023-01-01',
        endDate: null,
      },
    ];

    const result = filterContracts(contracts, partnerContracts, {
      partnerName: 'ITunes',
      effectiveDate: '2023-06-01',
    });

    expect(result).toHaveLength(2);
    const titles = result.map((r) => r.title);
    expect(titles).toContain('Active Hit');
    expect(titles).toContain('Also Active');
    expect(titles).not.toContain('Future Release');
    expect(titles).not.toContain('Expired Song');
    expect(titles).not.toContain('Wrong Usage');
  });
});
