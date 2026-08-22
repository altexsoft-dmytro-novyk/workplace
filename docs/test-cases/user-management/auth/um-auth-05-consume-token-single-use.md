# UM-AUTH-05 · A magic-link token cannot be consumed twice

**Trace:** own addition — not sourced from requirements, see SPEC assumptions

## Scenario

**Given** Alice already consumed her magic-link token once (`um-auth-03`).

**When** Alice, or anyone holding the same token value, submits it again.

**Then** the second attempt is denied — a one-time credential that survives reuse is a replay risk.

**Preconditions:** [fixture](../README.md#canonical-personas).

## Test

- **Test 1 — baseline: first consumption succeeds**
  - **inputURL:** `POST /auth/magic-link/consume`
  - **inputRequest:** `{ "headers": { "authorization": "" }, "body": { "token": "<magic-link-token:alice>" } }`
  - **expectedResult:** `200`; session token returned.
- **Test 2 — replay of the same token is denied**
  - **inputURL:** `POST /auth/magic-link/consume`
  - **inputRequest:** `{ "headers": { "authorization": "" }, "body": { "token": "<magic-link-token:alice>" } }`
  - **expectedResult:** `401`; no session/access token in the response body.
