# AC-M-S05-02 · S5 Documents — Self: editing/deleting documents denied

**Trace:** §3.2 S5 / Self `R (own)`

## Scenario

**Given** Alice can see her own contract.

**When** she tries to delete it.

**Then** 403 and the document remains — her only write right in S5 is uploading certificates (AC-M-S05-03).

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `DELETE /users/alice/documents/{contractId}`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; document remains
