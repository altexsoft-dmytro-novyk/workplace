# AC-M-S14-03 · S14 Action items — Self: marking own item complete

**Trace:** §3.2 S14 / Self `+ mark complete` · §4.5

## Scenario

**Given** Alice finished the task her action item asked for.

**When** she marks it complete.

**Then** the status flips to completed and the completion date is recorded and displayed.

**Preconditions:** [fixture](../../README.md); Alice has an open item

## Test

- **inputURL:** `POST /action-items/{id}/complete`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; status `completed`; completion date recorded and displayed
