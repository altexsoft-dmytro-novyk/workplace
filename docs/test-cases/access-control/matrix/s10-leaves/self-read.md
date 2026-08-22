# AC-M-S10-01 · S10 Leaves — Self: read

**Trace:** §3.2 S10 / Self `R` · §4.3 (managing them happens in the timetracker)

## Scenario

**Given** Alice's leave records are synced from the timetracker.

**When** she requests her leaves section (S10).

**Then** she sees all her records with dates and types; managing them happens in the timetracker, not here.

**Preconditions:** [fixture](../../README.md); leave records synced (vacation, sick leave)

## Test

- **inputURL:** `GET /users/alice/leaves`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; dates and types of all her leave records
