# AC-M-S13-10 · S13 Mentorship — Colleague: no write path (negative)

**Trace:** §3.2 S13 / Colleague `—` · §9 DoD

## Scenario

**Given** Colin has no standing over Alice.

**When** he tries to flip her open-to-mentor flag.

**Then** 404 — for him the section does not exist.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/relationships/{id}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "openToMentor": false
    }
  }
  ```
- **expectedResult:** `404`; unchanged
