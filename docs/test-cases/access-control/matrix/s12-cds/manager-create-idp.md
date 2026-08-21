# AC-M-S12-06 · S12 CDS — Manager line: create IDP

**Trace:** §3.2 S12 / Manager line `RW` · §4.10

## Scenario

**Given** after the assessment, Alice needs a development plan.

**When** Bob creates an IDP with a description, deadline and file link.

**Then** it is created as open — no completion date until Alice ticks it.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/idps`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "description": "growth to senior",
      "deadline": "2026-12-01",
      "link": "https://files.example/idp"
    }
  }
  ```
- **expectedResult:** `201`; IDP is *open* (no completion date)
