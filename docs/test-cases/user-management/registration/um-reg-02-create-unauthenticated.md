# UM-REG-02 · Create user without a session

**Trace:** PRD FR-1 · global 401 rule (see [../README.md](../README.md))

## Scenario

**Given** no caller, or one presenting no valid session token.

**When** a request to create a user is made.

**Then** it is rejected before any permission or entity logic runs — the endpoint never distinguishes "unauthenticated" from "would have been denied anyway" in a way that leaks information.

**Preconditions:** [fixture](../README.md#canonical-personas); none — this probes the endpoint independent of any seeded state.

## Test

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "" },
    "body": {
      "firstName": "Nina",
      "lastName": "Volkova",
      "workEmail": "nina.volkova@company.example"
    }
  }
  ```
- **expectedResult:** `401`; no `User` record created.
