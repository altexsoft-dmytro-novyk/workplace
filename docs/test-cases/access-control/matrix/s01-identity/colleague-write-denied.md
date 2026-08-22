# AC-M-S01-10 · S1 Identity card — Colleague: write denied

**Trace:** §3.2 S1 / Colleague `R`

## Scenario

**Given** Colin is a plain colleague of Alice.

**When** he tries to edit her identity card.

**Then** 403 — colleagues read S1, never write it.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "position": "X"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
