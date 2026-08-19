# AC-M-S05-02 · S5 Documents — Self: editing/deleting documents denied

**Trace:** §3.2 S5 / Self `R (own)`
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
- **expectedResult:** `403 Forbidden`; document remains — Self writes are limited to certificate upload (AC-M-S05-03)
