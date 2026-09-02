# UM-AUTH-04 · Consuming an expired magic-link token is denied

**Trace:** [DEC-UM-004](../../../architecture/user-management-test-decisions.md)
(expired token → `401`; TTL is configuration-owned) · epics.md Story 2.2
(expired token) · PRD FR-2

> **Reconciled 2026-09-02 (Story 2.2 Stage 1).** The token is minted for real
> (`POST /auth/magic-link`) and then its `expiresAt` is back-dated directly
> against the test database — expiry is the passage of time, which no request
> represents (DEC-UM-004: "tests inject a deterministic TTL and use a
> controllable clock"; a direct `expiresAt` back-date is the Stage-2 stand-in
> for that clock, per [testing-strategy.md](../../../architecture/testing-strategy.md)
> AD-3 "stage 2 seeds the fact directly").

## Scenario

**Given** Alice was issued a magic-link token (`um-auth-01`) whose `expiresAt`
is now in the past — the TTL has elapsed.

**When** Alice submits that expired token to `POST /auth/magic-link/consume`.

**Then** no session is established, and expiry does **not** count as
consumption.

**Preconditions:** [fixture](README.md#canonical-personas);
**stateChange:** a real `magic_link_token` row for Alice whose `expiresAt` has
been back-dated to a past instant, `consumedAt` still null.

## Test

- **inputURL:** `POST /auth/magic-link/consume`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "" },
    "body": { "token": "<the raw token whose row was back-dated>" }
  }
  ```
- **expectedResult:**
  - `401`.
  - **No** session token anywhere in the body (generic denial — DEC-UM-004; the
    body never reveals that the cause was expiry rather than not-found or
    already-consumed).
  - Alice's `magic_link_token` row still has `consumedAt` **null** after the
    call — an expired token is not "spent", it is simply refused (a later
    re-request re-mints; the expired row is inert either way).
