# AC-M-S08-10 · S8 Feedbacks — Colleague: no write path (negative)

**Trace:** §3.2 S8 / Colleague `—` (campaign-requested colleague feedback flows through §4.12 forms, not this API)

## Scenario

**Given** Colin has no standing over Alice.

**When** he tries to post feedback about her directly.

**Then** 404 — when a PP wants colleague input, it is requested through a form campaign, never through this section.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/feedbacks`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "body": "x"
    }
  }
  ```
- **expectedResult:** `404`; nothing created
