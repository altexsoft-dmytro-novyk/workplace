# AC-M-S07-02 · S7 — *visible for employee* flag exposes that record only

**Trace:** §3.2 S7 / Self (only records flagged *visible for employee*) · §3.3.2

## Scenario

**Given** two notes about Alice exist: N1 flagged *visible for employee*, N2 unflagged.

**When** Alice requests her notes section.

**Then** she sees exactly N1 and nothing hints that N2 exists — the flag opens one record, not the section.

**Preconditions:** [fixture](../../README.md); two notes about Alice: N1 flagged *visible for employee*, N2 unflagged

## Test

- **inputURL:** `GET /users/alice/sections/s07`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; exactly one record (N1); N2 absent entirely
