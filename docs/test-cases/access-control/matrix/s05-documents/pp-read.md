# AC-M-S05-07 · S5 Documents — PP: read

**Trace:** §3.2 S5 / PP `RW`

## Scenario

**Given** Paula is Alice's assigned People Partner.

**When** she requests Alice's documents.

**Then** she gets the full list — PP holds RW on S5.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/documents`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; document list
