# AC-M-S13-10 · S13 Mentorship — Colleague: no write path (negative)

**Trace:** §3.2 S13 / Colleague `—` · §9 DoD
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s13`
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
