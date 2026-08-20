# AC-M-S01-07 · S1 Identity card — PP: read

**Trace:** §3.2 S1 / PP `RW`

## Scenario

**Given** Paula is Alice's assigned People Partner.

**When** she requests Alice's identity card.

**Then** she gets the full card — PP holds RW on S1.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s01`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; body contains full name, photo, position, department/unit, country+city, work email, work phone, birthday (day+month), company start date, manager, PP, mentor, current project(s)
