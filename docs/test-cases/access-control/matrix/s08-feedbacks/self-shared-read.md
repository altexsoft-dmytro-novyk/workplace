# AC-M-S08-02 · S8 — *shared with employee* flag exposes that record only

**Trace:** §3.2 S8 / Self · §4.15 · §4.3
**Preconditions:** [fixture](../../README.md); F1 flagged *shared with employee*, F2 default

## Test

- **inputURL:** `GET /users/alice/sections/s08`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; exactly F1; F2 absent
