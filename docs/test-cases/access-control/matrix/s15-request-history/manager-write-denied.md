# AC-M-S15-03 · S15 Request history — Manager line: write denied

**Trace:** §3.2 S15 / Manager line `R` (history is written by the resourcing flow)

## Scenario

**Given** Dave can read Alice's request history.

**When** he tries to edit an entry.

**Then** 403 — history is written by the resourcing flow, never edited on the profile.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/request-history`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    },
    "body": {
      "status": "approved"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
