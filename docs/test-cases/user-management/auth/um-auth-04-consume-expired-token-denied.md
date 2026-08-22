# UM-AUTH-04 · Consuming an expired magic-link token is denied

**Trace:** own addition — not sourced from requirements, see SPEC assumptions

## Scenario

**Given** Alice was issued a magic-link token that has since expired.

**When** Alice submits that expired token to the consume endpoint.

**Then** no session is established.

**Preconditions:** [fixture](../README.md#canonical-personas); **stateChange:** the previously-issued token's TTL has elapsed — no request represents this, it is the passage of time.

## Test

- **inputURL:** `POST /auth/magic-link/consume`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "" },
    "body": { "token": "<expired-magic-link-token:alice>" }
  }
  ```
- **expectedResult:** `401`; no session/access token in the response body.
