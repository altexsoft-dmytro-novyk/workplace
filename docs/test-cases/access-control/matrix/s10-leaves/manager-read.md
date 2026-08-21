# AC-M-S10-03 · S10 Leaves — Manager line: read

**Trace:** §3.2 S10 / Manager line `R` (Frank: compound path)

## Scenario

**Given** Frank is a Manager of Alice via the compound chain (he manages her project's DM).

**When** he requests her leaves.

**Then** he can read dates and types — Manager line holds R on S10.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s10`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:frank>"
    }
  }
  ```
- **expectedResult:** `200`; dates and types
