# AC-M-S01-09 · S1 Identity card — Colleague: read

**Trace:** §3.2 S1 / Colleague `R` · §3.3.3

## Scenario

**Given** Colin is a plain colleague of Alice.

**When** he requests her identity card.

**Then** he gets it in full — S1 is readable by every authenticated colleague.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; body contains full name, photo, position, department/unit, country+city, work email, work phone, birthday (day+month), company start date, manager, PP, mentor, current project(s) — the full identity card
