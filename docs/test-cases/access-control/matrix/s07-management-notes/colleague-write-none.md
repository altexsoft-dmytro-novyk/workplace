# AC-M-S07-14 · S7 Management notes — Colleague: no write path (negative)

**Trace:** §3.2 S7 / Colleague `—` · §9 DoD
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/notes`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "body": "x"
    }
  }
  ```
- **expectedResult:** `404`; nothing created
