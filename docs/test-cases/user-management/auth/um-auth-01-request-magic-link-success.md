# UM-AUTH-01 · Request a magic link for a registered email

**Trace:** PRD FR-2 ("a magic link sent to workEmail is the sole login mechanism")

## Scenario

**Given** Alice, an existing user with `workEmail: alice@company.example`.

**When** Alice requests a magic link for that email, unauthenticated (she has no session yet).

**Then** the request succeeds and a link is dispatched to that address — no password is ever requested or stored.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded with `workEmail: alice@company.example`.

## Test

- **inputURL:** `POST /auth/magic-link`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "" },
    "body": { "email": "alice@company.example" }
  }
  ```
- **expectedResult:** `200`; body confirms dispatch (e.g. `{ "sent": true }`) and contains no token, password field, or user-existence signal beyond the generic confirmation.
