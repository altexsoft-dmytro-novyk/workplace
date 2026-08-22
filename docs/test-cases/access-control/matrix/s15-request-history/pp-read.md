# AC-M-S15-04 · S15 Request history — PP: read

**Trace:** §3.2 S15 / PP `R`

## Scenario

**Given** Paula is Alice's assigned People Partner.

**When** she requests Alice's request history.

**Then** she sees the full attempt history with feedback.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/request-history`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; full attempt history with feedback
