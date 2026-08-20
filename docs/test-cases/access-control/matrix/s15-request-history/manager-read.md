# AC-M-S15-02 · S15 Request history — Manager line: read

**Trace:** §3.2 S15 / Manager line `R` · §4.7 (a DM sees their own requests natively)

## Scenario

**Given** Alice has a proposed-then-rejected attempt in her history, and Dave is a Manager of hers as DM.

**When** he requests her request history (S15).

**Then** he sees every attempt with its outcome and feedback.

**Preconditions:** [fixture](../../README.md); Alice has proposed→rejected history

## Test

- **inputURL:** `GET /users/alice/sections/s15`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200`; each attempt: proposed → approved/rejected, with feedback
