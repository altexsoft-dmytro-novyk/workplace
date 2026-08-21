# AC-M-S13-04 · S13 Mentorship — Manager line: read

**Trace:** §3.2 S13 / Manager line `RW`

## Scenario

**Given** Bob is Alice's unit manager.

**When** he requests her mentorship section.

**Then** he sees the full section — flag, pairs, history.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s13`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; full section
