# AC-M-S14-07 · S14 Action items — author cancels with a reason

**Trace:** §4.5 lifecycle
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
