# AC-M-S05-05 · S5 Documents — Manager line: read

**Trace:** §3.2 S5 / Manager line `R` (Dave: project path)
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s05`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200`; document list
