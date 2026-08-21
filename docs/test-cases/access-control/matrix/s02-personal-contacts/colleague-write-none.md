# AC-M-S02-08 · S2 Personal contacts — Colleague: no write path (negative)

**Trace:** §3.2 S2 / Colleague `—` · §9 DoD

## Scenario

**Given** Colin cannot even see Alice's personal contacts.

**When** he tries to write them.

**Then** 404 — for him the section does not exist at all.

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
- **expectedResult:** `404`; unchanged
