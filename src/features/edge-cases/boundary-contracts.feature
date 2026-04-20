Feature: Date boundary edge cases

  As a user of the Global Rights Management platform
  I want exact date boundary handling to be reliable
  So that contracts are correctly included or excluded at the edges

  Scenario: All-access partner on exact boundary date
    Given the boundary reference data
    When user perform search by "AllAccess" "2024-06-15"
    Then the output should be
      | Artist       | Title              | Usages           | StartDate  | EndDate    |
      | Boundary Act | Long Runner        | digital download | 2020-01-01 | 2030-12-31 |
      | Boundary Act | Same Day Contract  | digital download | 2024-06-15 | 2024-06-15 |
      | Boundary Act | Same Day Contract  | streaming        | 2024-06-15 | 2024-06-15 |
      | Edge Case    | Ends Today         | streaming        | 2024-01-01 | 2024-06-15 |
      | Edge Case    | Starts Today       | digital download | 2024-06-15 |            |

  Scenario: Download-only partner filters out streaming contracts
    Given the boundary reference data
    When user perform search by "DownloadOnly" "2024-06-15"
    Then the output should be
      | Artist       | Title              | Usages           | StartDate  | EndDate    |
      | Boundary Act | Long Runner        | digital download | 2020-01-01 | 2030-12-31 |
      | Boundary Act | Same Day Contract  | digital download | 2024-06-15 | 2024-06-15 |
      | Edge Case    | Starts Today       | digital download | 2024-06-15 |            |

  Scenario: Day after boundary excludes same-day and ended-today contracts
    Given the boundary reference data
    When user perform search by "AllAccess" "2024-06-16"
    Then the output should be
      | Artist       | Title              | Usages           | StartDate  | EndDate    |
      | Boundary Act | Long Runner        | digital download | 2020-01-01 | 2030-12-31 |
      | Edge Case    | Starts Today       | digital download | 2024-06-15 |            |
      | Edge Case    | Starts Tomorrow    | streaming        | 2024-06-16 |            |
