# UM-AUTH-02 · Request a magic link for an unregistered email

**Trace:** PRD FR-2 · own addition — not sourced from requirements, see SPEC assumptions

## Scenario

**Given** an email address with no matching `User` record.

**When** a magic link is requested for that address.

**Then** the response is identical in shape and status to `um-auth-01`'s success case — the endpoint must not reveal whether an account exists for a given email (account enumeration).

**Preconditions:** [fixture](../README.md#canonical-personas); `nobody@company.example` has no matching `User` row.

## Test

- **inputURL:** `POST /auth/magic-link`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "" },
    "body": { "email": "nobody@company.example" }
  }
  ```
- **expectedResult:** `200`; same body shape as `um-auth-01` (e.g. `{ "sent": true }`); no email is actually dispatched (asserted at the email-adapter fake in stage 2).
