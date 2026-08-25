# UM-AUTH-05 · A magic-link token cannot be consumed twice

**Trace:** [DEC-UM-004](../../../architecture/user-management-test-decisions.md) · epics.md Story 2.2 (single-use token) · PRD FR-2

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
