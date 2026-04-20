Feature: Search for active music contracts

  As a user of the Global Rights Management platform
  I want to search for active music contracts by partner and date
  So that I can determine which products are available for distribution

  Scenario: Search for active music contracts
    Given the supplied reference data
    When user perform search by "ITunes" "2012-03-01"
    Then the output should be
      | Artist       | Title                   | Usages           | StartDate  | EndDate    |
      | Monkey Claw  | Black Mountain          | digital download | 2012-02-01 |            |
      | Monkey Claw  | Motor Mouth             | digital download | 2011-03-01 |            |
      | Tinie Tempah | Frisky (Live from SoHo) | digital download | 2012-02-01 |            |
      | Tinie Tempah | Miami 2 Ibiza           | digital download | 2012-02-01 |            |

  Scenario: Search for active music contracts_2
    Given the supplied reference data
    When user perform search by "YouTube" "2012-12-27"
    Then the output should be
      | Artist       | Title                   | Usages    | StartDate  | EndDate    |
      | Monkey Claw  | Christmas Special       | streaming | 2012-12-25 | 2012-12-31 |
      | Monkey Claw  | Iron Horse              | streaming | 2012-06-01 |            |
      | Monkey Claw  | Motor Mouth             | streaming | 2011-03-01 |            |
      | Tinie Tempah | Frisky (Live from SoHo) | streaming | 2012-02-01 |            |

  Scenario: Search for active music contracts_3
    Given the supplied reference data
    When user perform search by "YouTube" "2012-04-01"
    Then the output should be
      | Artist       | Title                   | Usages    | StartDate  | EndDate |
      | Monkey Claw  | Motor Mouth             | streaming | 2011-03-01 |         |
      | Tinie Tempah | Frisky (Live from SoHo) | streaming | 2012-02-01 |         |
