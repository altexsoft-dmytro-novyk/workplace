# AC-M-S12-05 · S12 CDS — Manager line: create assessment record

**Trace:** §3.2 S12 / Manager line `RW` · §4.10

## Scenario

**Given** Alice completed a CDS assessment outside the system.

**When** Bob registers it with the date, assessor, result link and final conclusion.

**Then** the record lands in her assessment log — the system is the registry, the assessment itself happened elsewhere.

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
