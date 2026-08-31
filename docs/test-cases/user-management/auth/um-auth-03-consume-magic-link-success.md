# UM-AUTH-03 · Consuming a valid magic-link token establishes a session

**Trace:** PRD FR-2

## Scenario

**Given** Alice has requested a magic link (`um-auth-01`) and holds the resulting one-time token.

**When** Alice submits that token to the consume endpoint.

**Then** a session/access token is returned, scoped to Alice, usable for subsequent authenticated requests.

**Preconditions:** [fixture](../README.md#canonical-personas); a valid, unexpired magic-link token exists for Alice (issued by the `um-auth-01` flow).

## Test

- **inputURL:** `POST /auth/magic-link/consume`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "" },
    "body": { "token": "<magic-link-token:alice>" }
  }
  ```
- **expectedResult:** `200`; body includes a session/access token identifying Alice; a follow-up authenticated request using that token (e.g. `GET /users/:aliceId`) succeeds with `200`.

> **v1.5 fixture note (2026-09-01).** Alice and every persona here come from the **seeded population import** (Story 1.1, `seed/`), not `POST /users` — that route is retired (AD-14/AD-16). The magic-link token has no HTTP-observable seam; it stays a literal placeholder until a fake email adapter lands (Epic 2 stage 2).
