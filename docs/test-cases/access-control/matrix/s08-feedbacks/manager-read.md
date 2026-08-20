# AC-M-S08-04 · S8 Feedbacks — Manager line: read all, regardless of flag

**Trace:** §3.2 S8 / Manager line `RW` · §4.15

## Scenario

**Given** feedback about Alice exists at both visibility levels.

**When** Bob, her unit manager, requests the section.

**Then** he sees every record with author, date, context and body — visibility flags gate the employee, not the management line.

**Preconditions:** [fixture](../../README.md); records exist at both visibility levels

## Test

- **inputURL:** `GET /users/alice/sections/s08`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; all records at both visibility levels, with author, date, context, body
