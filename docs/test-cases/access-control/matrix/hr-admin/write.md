# AC-M-HR-02 · HR Admin: writes everything

**Trace:** §3.1 · §2.2

## Scenario

**Given** Root administers profile data across the organisation.

**When** he updates Alice's grade.

**Then** the change persists — HR Admin writes everywhere.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s04`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:root>"
    },
    "body": {
      "grade": "M3"
    }
  }
  ```
- **expectedResult:** `200`; persisted
