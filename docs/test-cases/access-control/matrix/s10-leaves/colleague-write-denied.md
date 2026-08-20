# AC-M-S10-08 · S10 Leaves — Colleague: write denied

**Trace:** §3.2 S10 / Colleague `R`

## Scenario

**Given** Colin can read Alice's leaves.

**When** he tries to change one.

**Then** 403 — reading S10 is whitelisted for colleagues, writing is not.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s10`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "type": "vacation"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
