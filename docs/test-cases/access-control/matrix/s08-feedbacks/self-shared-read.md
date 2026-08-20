# AC-M-S08-02 · S8 — *shared with employee* flag exposes that record only

**Trace:** §3.2 S8 / Self · §4.15 · §4.3

## Scenario

**Given** two feedback records about Alice exist: F1 shared with her, F2 management-only.

**When** she requests her feedback section.

**Then** she sees exactly F1 — sharing opens one record, not the section.

**Preconditions:** [fixture](../../README.md); F1 flagged *shared with employee*, F2 default

## Test

- **inputURL:** `GET /users/alice/sections/s08`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; exactly F1; F2 absent
