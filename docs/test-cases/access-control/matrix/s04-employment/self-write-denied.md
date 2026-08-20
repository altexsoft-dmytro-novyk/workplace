# AC-M-S04-02 · S4 Employment — Self: write denied

**Trace:** §3.2 S4 / Self `R`

## Scenario

**Given** Alice can see her own grade.

**When** she tries to raise it herself.

**Then** 403 — employment data is written by managers and PP only.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s04`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "grade": "M9"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
