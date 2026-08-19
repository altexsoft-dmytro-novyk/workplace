# AC-M-S13-03 · S13 Mentorship — Self: pairs are read-only

**Trace:** §3.2 S13 / Self `R (pairs)` · §4.11 (ending is a manager/PP act)
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `DELETE /mentorship-pairs/{activePairId}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "finalFeedback": "was great"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; pair still active
