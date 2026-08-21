# AC-M-S07-12 · S7 — PP creates and edits notes

**Trace:** §3.2 S7 / PP `RW` · §3.3.2

## Scenario

**Given** Paula discussed a coaching plan with Alice's manager.

**When** she writes a management note about Alice.

**Then** it is created — PP holds RW on S7.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/notes`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "body": "coaching plan discussed"
    }
  }
  ```
- **expectedResult:** `201`
