# AC-M-S11-02 · S11 Projects — Self: write denied

**Trace:** §3.2 S11 / Self `R` (assignments come from the timetracker)

## Scenario

**Given** Alice can see her project assignments.

**When** she tries to change them here.

**Then** 403 — assignments come from the timetracker sync.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s11`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "project": "Atlas"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
