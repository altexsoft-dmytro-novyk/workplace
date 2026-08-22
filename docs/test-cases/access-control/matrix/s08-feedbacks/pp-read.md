# AC-M-S08-07 · S8 Feedbacks — PP: read all, regardless of flag

**Trace:** §3.2 S8 / PP `RW`

## Scenario

**Given** feedback about Alice exists at both visibility levels.

**When** Paula, her assigned PP, requests the section.

**Then** she sees every record — PP holds RW on S8.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/feedbacks`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; all records at both visibility levels
