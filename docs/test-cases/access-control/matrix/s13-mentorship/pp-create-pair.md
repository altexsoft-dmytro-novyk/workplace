# AC-M-S13-08 · S13 Mentorship — PP: create a pair

**Trace:** §3.2 S13 / PP `RW` · §4.11
**Preconditions:** [fixture](../../README.md); Alice flagged open-to-mentor

## Test

- **inputURL:** `POST /mentorship-pairs`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "mentor": "alice",
      "mentee": "<employee available to Paula>"
    }
  }
  ```
- **expectedResult:** `201`
