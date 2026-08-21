# AC-M-S02-03 · S2 Personal contacts — Manager line: read

**Trace:** §3.2 S2 / Manager line `R` (Pete: PM parity on non-S7 sections, §3.3.2)

## Scenario

**Given** Pete is the PM of Alice's project — a full Manager for every section but S7.

**When** he requests her personal contacts.

**Then** he can read them but nothing more — Manager line holds R on S2.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s02`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:pete>"
    }
  }
  ```
- **expectedResult:** `200`; body contains personal phone, personal email, messengers, residential address, current place of stay
