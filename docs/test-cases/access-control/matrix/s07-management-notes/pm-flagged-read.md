# AC-M-S07-05 · S7 — *visible for PM* flag: PM reads that record only

**Trace:** §3.2 S7 (PM exception: R, only records flagged *visible for PM*)

## Scenario

**Given** two notes about Alice exist: N1 flagged *visible for PM*, N2 unflagged.

**When** Pete requests her notes section.

**Then** he sees exactly N1 — the flag opens one record to the project chain's PMs, nothing else.

**Preconditions:** [fixture](../../README.md); two notes about Alice: N1 flagged *visible for PM*, N2 unflagged

## Test

- **inputURL:** `GET /users/alice/sections/s07`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:pete>"
    }
  }
  ```
- **expectedResult:** `200`; exactly N1; N2 absent
