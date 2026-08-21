# AC-M-S11-04 · S11 Projects — Manager line: write denied

**Trace:** §3.2 S11 / Manager line `R`

## Scenario

**Given** Bob can read Alice's project assignments.

**When** he tries to reassign her here.

**Then** 403 — assignments are timetracker-owned.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s11`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "project": "Atlas"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
