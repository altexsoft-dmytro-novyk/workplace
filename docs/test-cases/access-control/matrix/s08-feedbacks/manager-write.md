# AC-M-S08-05 · S8 Feedbacks — Manager line: create (default management-only)

**Trace:** §3.2 S8 / Manager line `RW` · §4.15
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/feedbacks`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "context": "project Phoenix, Q3",
      "body": "…"
    }
  }
  ```
- **expectedResult:** `201`; visibility defaults to *management only*
