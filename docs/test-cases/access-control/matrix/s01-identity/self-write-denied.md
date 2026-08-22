# AC-M-S01-02 · S1 Identity card — Self: write denied (photo excepted)

**Trace:** §3.2 S1 / Self `R`

## Scenario

**Given** Alice can read her identity card but not edit it.

**When** she tries to change her own position.

**Then** 403 and nothing changes — only her photo is Self-editable (AC-M-S01-03).

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "position": "CTO"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
