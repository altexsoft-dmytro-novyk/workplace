# AC-M-S06-08 · S6 Risks — Colleague: no write path (negative)

**Trace:** §3.2 S6 / Colleague `—` · §9 DoD
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
