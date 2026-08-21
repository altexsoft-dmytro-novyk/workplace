# AC-M-S06-08 · S6 Risks — Colleague: no write path (negative)

**Trace:** §3.2 S6 / Colleague `—` · §9 DoD

## Scenario

**Given** Colin has no standing over Alice.

**When** he tries to record a risk about her.

**Then** 404 — for him the section does not exist.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/risks`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "level": "high",
      "description": "x"
    }
  }
  ```
- **expectedResult:** `404`; nothing created
