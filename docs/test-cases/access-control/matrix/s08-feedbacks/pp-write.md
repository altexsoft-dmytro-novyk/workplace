# AC-M-S08-08 · S8 Feedbacks — PP: create

**Trace:** §3.2 S8 / PP `RW` · §4.15

## Scenario

**Given** Paula gathered impressions during Alice's onboarding.

**When** she records a feedback entry.

**Then** it is created — PP holds RW on S8.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/feedbacks`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "context": "onboarding period",
      "body": "…"
    }
  }
  ```
- **expectedResult:** `201`
