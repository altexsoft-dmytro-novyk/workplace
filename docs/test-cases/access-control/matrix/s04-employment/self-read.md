# AC-M-S04-01 · S4 Employment — Self: read

**Trace:** §3.2 S4 / Self `R` · §4.3

## Scenario

**Given** Alice is viewing her own profile.

**When** she requests her employment section (S4).

**Then** she sees her grade, seniority, English level and the rest — Self holds R on S4.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/employment`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; body contains employee type, grade, seniority, position history, English level, probation status, employment status, contract type
