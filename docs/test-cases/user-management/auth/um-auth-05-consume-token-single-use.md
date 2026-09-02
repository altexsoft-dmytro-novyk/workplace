# UM-AUTH-05 · A magic-link token cannot be consumed twice

**Trace:** [DEC-UM-004](../../../architecture/user-management-test-decisions.md)
(single-use — replay returns `401`) · epics.md Story 2.2 (single-use token) ·
PRD FR-2

> **Reconciled 2026-09-02 (Story 2.2 Stage 1).** Real token, minted by a real
> `POST /auth/magic-link` call inside the suite, raw value read from the
> recording dispatcher. This file is the **dedicated single-use anchor**; it
> overlaps `um-auth-03` Test 2 by design (that one asserts the replay directly
> after a success in the happy-path flow) — both are kept.

## Scenario

**Given** Alice already consumed her magic-link token once (`um-auth-03` Test 1
succeeded — `200`, `consumedAt` set).

**When** Alice, or anyone else holding the same raw token value, submits it
again to `POST /auth/magic-link/consume`.

**Then** the second attempt is denied — a one-time credential that survived
reuse would be a replay risk.

**Preconditions:** [fixture](README.md#canonical-personas); a real
`magic_link_token` for Alice, minted in-suite.

## Test

- **Test 1 — baseline: first consumption succeeds**
  - **inputURL:** `POST /auth/magic-link/consume`
  - **inputRequest:** `{ "headers": { "authorization": "" }, "body": { "token": "<the raw minted token>" } }`
  - **expectedResult:** `200`; a session token scoped to Alice is returned
    (shape per [README §Story 2.2 session-token decisions](README.md#story-22--session-token-decisions-confirm-at-approval));
    the row's `consumedAt` is now set.
- **Test 2 — replay of the same token is denied**
  - **inputURL:** `POST /auth/magic-link/consume`
  - **inputRequest:** `{ "headers": { "authorization": "" }, "body": { "token": "<the same raw token>" } }`
  - **expectedResult:** `401`; **no** session/access token anywhere in the
    response body (generic denial — DEC-UM-004).
