# AC-M-S12-05 · S12 CDS — Manager line: create assessment record

**Trace:** §3.2 S12 / Manager line `RW` · §4.10
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/assessments`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "date": "2026-08-01",
      "assessor": "bob",
      "resultLink": "https://files.example/r",
      "conclusion": "meets expectations"
    }
  }
  ```
- **expectedResult:** `201`
