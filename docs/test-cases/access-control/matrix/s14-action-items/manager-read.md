# AC-M-S14-04 · S14 Action items — Manager line: read

**Trace:** §3.2 S14 / Manager line `RW`

## Scenario

**Given** Bob is Alice's unit manager.

**When** he requests her action items.

**Then** he sees them all.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s14`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; all items
