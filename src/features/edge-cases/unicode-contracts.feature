Feature: Unicode and special characters in contracts

  As a user of the Global Rights Management platform
  I want artists and titles with accented characters, symbols, and punctuation to work correctly
  So that international catalogs are fully supported

  Scenario: Multi-usage partner sees all unicode contracts
    Given the unicode reference data
    When user perform search by "Deezer" "2021-08-01"
    Then the output should be
      | Artist                    | Title                   | Usages           | StartDate  | EndDate    |
      | Björk & The Sugarcubes    | Möbius Strip            | streaming        | 2019-11-15 |            |
      | José González             | Heartbeats (Acoustic)   | digital download | 2018-05-01 |            |
      | José González             | Heartbeats (Acoustic)   | streaming        | 2018-05-01 |            |
      | Naïve Café                | L'Été Dernier           | digital download | 2021-07-14 |            |
      | Naïve Café                | L'Été Dernier           | streaming        | 2021-07-14 |            |
      | Sigur Rós                 | ( )                     | streaming        | 2019-01-01 |            |
      | Sigur Rós                 | Hoppípolla — Remix      | digital download | 2020-03-01 | 2023-12-31 |

  Scenario: Streaming-only partner filters to streaming usage
    Given the unicode reference data
    When user perform search by "StreamCo" "2021-08-01"
    Then the output should be
      | Artist                    | Title                   | Usages    | StartDate  | EndDate |
      | Björk & The Sugarcubes    | Möbius Strip            | streaming | 2019-11-15 |         |
      | José González             | Heartbeats (Acoustic)   | streaming | 2018-05-01 |         |
      | Naïve Café                | L'Été Dernier           | streaming | 2021-07-14 |         |
      | Sigur Rós                 | ( )                     | streaming | 2019-01-01 |         |

  Scenario: Expired bounded contract excluded for unicode data
    Given the unicode reference data
    When user perform search by "Deezer" "2024-03-01"
    Then the output should be
      | Artist                    | Title                   | Usages           | StartDate  | EndDate |
      | Björk & The Sugarcubes    | Möbius Strip            | streaming        | 2019-11-15 |         |
      | José González             | Heartbeats (Acoustic)   | digital download | 2018-05-01 |         |
      | José González             | Heartbeats (Acoustic)   | streaming        | 2018-05-01 |         |
      | Naïve Café                | L'Été Dernier           | digital download | 2021-07-14 |         |
      | Naïve Café                | L'Été Dernier           | streaming        | 2021-07-14 |         |
      | Sigur Rós                 | ( )                     | streaming        | 2019-01-01 |         |
