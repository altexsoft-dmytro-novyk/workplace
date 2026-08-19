# AC-M-S02-08 · S2 Personal contacts — Colleague: no write path (negative)

**Trace:** §3.2 S2 / Colleague `—` · §9 DoD
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s02`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "personalPhone": "+1-555-0100"
    }
  }
  ```
- **expectedResult:** `404`; unchanged — the section does not exist for this viewer
