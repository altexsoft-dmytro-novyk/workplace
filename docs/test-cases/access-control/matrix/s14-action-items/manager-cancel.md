# AC-M-S14-07 · S14 Action items — author cancels with a reason

**Trace:** §4.5 lifecycle

## Scenario

**Given** an item Bob authored is no longer relevant.

**When** he cancels it, providing the reason.

**Then** the item is cancelled with the reason on record.

**Preconditions:** [fixture](../../README.md); Bob authored the item

## Test

- **inputURL:** `POST /action-items/{ownItemId}/cancel`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "reason": "no longer relevant"
    }
  }
  ```
- **expectedResult:** `200`; cancelled with the reason recorded
