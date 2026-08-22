# AC-M-S15-05 · S15 Request history — PP: write denied

**Trace:** §3.2 S15 / PP `R`

## Scenario

**Given** Paula can read Alice's request history.

**When** she tries to edit an entry.

**Then** 403 — read-only for everyone outside the resourcing flow.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/request-history`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "status": "approved"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
