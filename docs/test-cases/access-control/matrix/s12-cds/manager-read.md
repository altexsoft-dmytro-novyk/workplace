# AC-M-S12-04 · S12 CDS — Manager line: read

**Trace:** §3.2 S12 / Manager line `RW` · §4.10

## Scenario

**Given** Bob is Alice's unit manager.

**When** he requests her CDS section.

**Then** he sees the full section — matrix link, assessments, IDPs.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s12`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; full CDS section
