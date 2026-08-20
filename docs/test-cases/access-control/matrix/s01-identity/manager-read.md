# AC-M-S01-04 · S1 Identity card — Manager line: read

**Trace:** §3.2 S1 / Manager line `RW`

## Scenario

**Given** Bob is Alice's unit manager.

**When** he requests her identity card.

**Then** he gets the full card — Manager line holds RW on S1.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s01`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; body contains full name, photo, position, department/unit, country+city, work email, work phone, birthday (day+month), company start date, manager, PP, mentor, current project(s)
