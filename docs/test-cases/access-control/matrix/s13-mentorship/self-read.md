# AC-M-S13-01 · S13 Mentorship — Self: read

**Trace:** §3.2 S13 / Self `RW (own flag), R (pairs)` · §4.11
**Preconditions:** [fixture](../../README.md); Alice has an assigned mentor and one ended pair in history

## Test

- **inputURL:** `GET /users/alice/sections/s13`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; her open-to-mentor flag, assigned mentor (Mia), mentees, ended pairs with dates
