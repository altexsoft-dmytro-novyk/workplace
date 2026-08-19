# AC-M-S05-10 · S5 Documents — Colleague: no write path (negative)

**Trace:** §3.2 S5 / Colleague `—` · §9 DoD
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/documents`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "type": "certificate",
      "file": "<multipart>"
    }
  }
  ```
- **expectedResult:** `404`; nothing created
