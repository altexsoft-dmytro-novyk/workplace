# AC-M-S07-10 · S7 — UM/DM edit notes and flags

**Trace:** §3.3.2 (Dave: DM parity)
**Preconditions:** [fixture](../../README.md); an unflagged note about Alice exists

## Test

- **inputURL:** `PATCH /users/alice/notes/{id}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    },
    "body": {
      "visibleForPM": true
    }
  }
  ```
- **expectedResult:** `200`; flag change persisted
