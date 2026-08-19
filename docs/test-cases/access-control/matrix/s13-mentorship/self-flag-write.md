# AC-M-S13-02 · S13 Mentorship — Self: own open-to-mentor flag is writable

**Trace:** §3.2 S13 / Self `RW (own flag)` · §4.11
**Preconditions:** [fixture](../../README.md); flag currently off

## Test

- **inputURL:** `PATCH /users/alice/sections/s13`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "openToMentor": true
    }
  }
  ```
- **expectedResult:** `200`; persisted; Alice appears in the willing-mentors list for managers
