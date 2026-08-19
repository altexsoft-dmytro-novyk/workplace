# AC-M-S15-02 · S15 Request history — Manager line: read

**Trace:** §3.2 S15 / Manager line `R` · §4.7 (Dave also matches the matrix note: a DM sees their own requests natively)
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
