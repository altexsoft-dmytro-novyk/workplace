# AC-M-S14-08 · S14 Action items — PP: read

**Trace:** §3.2 S14 / PP `RW`

## Scenario

**Given** Paula is Alice's assigned People Partner.

**When** she requests Alice's action items.

**Then** she sees them all.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /action-items`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; all items
