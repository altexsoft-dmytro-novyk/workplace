# AC-M-S01-05 · S1 Identity card — Manager line: write

**Trace:** §3.2 S1 / Manager line `RW`

## Scenario

**Given** Bob is Alice's unit manager.

**When** he updates her position.

**Then** the change persists — Manager line holds RW on S1.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s01`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "position": "Senior Engineer"
    }
  }
  ```
- **expectedResult:** `200`; persisted
