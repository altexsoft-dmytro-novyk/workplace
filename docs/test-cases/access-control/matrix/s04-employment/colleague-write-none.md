# AC-M-S04-08 · S4 Employment — Colleague: no write path (negative)

**Trace:** §3.2 S4 / Colleague `—` · §9 DoD

## Scenario

**Given** Colin cannot even see Alice's employment data.

**When** he tries to write her grade.

**Then** 404 — for him the section does not exist.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s04`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "grade": "M1"
    }
  }
  ```
- **expectedResult:** `404`; unchanged
