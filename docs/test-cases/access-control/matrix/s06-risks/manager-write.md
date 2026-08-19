# AC-M-S06-04 · S6 Risks — Manager line: write

**Trace:** §3.2 S6 / Manager line `RW` · §4.6
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/risks`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    },
    "body": {
      "level": "medium",
      "description": "workload concerns",
      "details": "…",
      "date": "2026-08-19"
    }
  }
  ```
- **expectedResult:** `201`; becomes the current record; trend recalculated against the previous one
