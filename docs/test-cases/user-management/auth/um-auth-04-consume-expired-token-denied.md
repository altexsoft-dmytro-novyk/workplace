# UM-AUTH-04 · Consuming an expired magic-link token is denied

**Trace:** [DEC-UM-004](../../../architecture/user-management-test-decisions.md) · epics.md Story 2.2 (expired token) · PRD FR-2

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

> **v1.5 fixture note (2026-09-01).** Alice and every persona here come from the **seeded population import** (Story 1.1, `seed/`), not `POST /users` — that route is retired (AD-14/AD-16). The magic-link token has no HTTP-observable seam; it stays a literal placeholder until a fake email adapter lands (Epic 2 stage 2).
