# AC-M-S16-09 · S16 Custom fields — Manager line: write any field

**Trace:** §3.2 S16 / Manager line `RW` · §4.1

## Scenario

**Given** custom fields at all three visibility levels exist on Alice.

**When** Bob sets the `visa-status` value.

**Then** the change persists — Manager line writes custom fields regardless of their visibility level.

**Preconditions:** [fixture](../../README.md); fields at all three visibility levels exist on Alice

## Test

- **inputURL:** `PATCH /users/alice/custom-fields`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "visa-status": "valid"
    }
  }
  ```
- **expectedResult:** `200`; persisted
