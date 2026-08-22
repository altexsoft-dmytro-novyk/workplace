# AC-M-S02-04 · S2 Personal contacts — Manager line: write denied

**Trace:** §3.2 S2 / Manager line `R`

## Scenario

**Given** Pete, as Alice's PM, can read her personal contacts.

**When** he tries to change her personal phone.

**Then** 403 — managers read S2, only Alice herself and her PP write it.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/personal-contacts`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:pete>"
    },
    "body": {
      "personalPhone": "+1-555-0100"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
