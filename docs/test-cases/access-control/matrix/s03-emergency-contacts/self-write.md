# AC-M-S03-02 · S3 Emergency contacts — Self: write

**Trace:** §3.2 S3 / Self `RW` · §4.3

## Scenario

**Given** Alice's emergency contact changed their number.

**When** she updates the phone herself.

**Then** the change persists without asking HR.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s03`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "phone": "+380-67-000-0000"
    }
  }
  ```
- **expectedResult:** `200`; persisted
