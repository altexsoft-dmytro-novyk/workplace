# AC-M-S04-04 · S4 Employment — Manager line: write

**Trace:** §3.2 S4 / Manager line `RW`

## Scenario

**Given** Alice passed an English assessment.

**When** Bob records her new level.

**Then** the change persists.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/employment`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "englishLevel": "C1"
    }
  }
  ```
- **expectedResult:** `200`; persisted
