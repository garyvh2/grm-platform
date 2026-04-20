Feature: Sparse data and empty results

  As a user of the Global Rights Management platform
  I want correct results even when most contracts are expired or inapplicable
  So that edge cases with zero or minimal matches are handled gracefully

  Scenario: Single match among mostly expired contracts
    Given the sparse reference data
    When user perform search by "RetroShop" "2023-06-01"
    Then the output should be
      | Artist    | Title          | Usages           | StartDate  | EndDate |
      | Lone Wolf | Sole Survivor  | digital download | 2023-01-01 |         |

  Scenario: Zero results when all contracts are outside date range
    Given the sparse reference data
    When user perform search by "FutureStream" "2023-06-01"
    Then the output should be empty

  Scenario: Multi-usage partner still finds only one active contract
    Given the sparse reference data
    When user perform search by "MixMaster" "2023-06-01"
    Then the output should be
      | Artist    | Title          | Usages           | StartDate  | EndDate |
      | Lone Wolf | Sole Survivor  | digital download | 2023-01-01 |         |

  Scenario: Future date unlocks a previously unreachable contract
    Given the sparse reference data
    When user perform search by "MixMaster" "2025-06-01"
    Then the output should be
      | Artist    | Title          | Usages           | StartDate  | EndDate |
      | Lone Wolf | Out of Reach   | streaming        | 2025-01-01 |         |
      | Lone Wolf | Sole Survivor  | digital download | 2023-01-01 |         |
