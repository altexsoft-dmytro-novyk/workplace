# AC-M-S01-01 · S1 Identity card — Self: read

**Trace:** §3.2 S1 / Self `R (photo RW)`

## Scenario

**Given** Alice is viewing her own profile.

**When** she requests her identity card (S1).

**Then** she gets the full card — the Self cell for S1 is R.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s01`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; body contains full name, photo, position, department/unit, country+city, work email, work phone, birthday (day+month), company start date, manager, PP, mentor, current project(s)
