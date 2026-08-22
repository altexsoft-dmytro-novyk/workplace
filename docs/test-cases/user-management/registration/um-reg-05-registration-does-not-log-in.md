# UM-REG-05 · Registration does not establish a session

**Trace:** PRD FR-3 ("Completing the registration form does not log the user in directly — it triggers the same magic-link email used for every subsequent login. There is no separate invite-link mechanism.")

## Scenario

**Given** Root creates Nina via the registration endpoint.

**When** the creation succeeds.

**Then** no session/access token is returned or established for Nina — only a magic-link email is triggered, identical to the flow Nina will use for every later login (see `auth/um-auth-01`).

**Preconditions:** [fixture](../README.md#canonical-personas); no existing user with Nina's `workEmail`.

## Test

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": {
      "firstName": "Nina",
      "lastName": "Volkova",
      "workEmail": "nina.volkova@company.example"
    }
  }
  ```
- **expectedResult:** `201`; response body contains no `accessToken`/`sessionToken`/`Set-Cookie` of any kind — only the created `User` representation. A magic-link dispatch is triggered as a side effect (asserted at the email-adapter fake in stage 2, not in this response body).
