# AC-M-S13-03 · S13 Mentorship — Self: pairs are read-only

**Trace:** §3.2 S13 / Self `R (pairs)` · §4.11 (ending is a manager/PP act)

## Scenario

**Given** Alice is in an active mentorship pair.

**When** she tries to end it herself.

**Then** 403 and the pair stays active — ending a pair is a manager/PP act with required final feedback.

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
