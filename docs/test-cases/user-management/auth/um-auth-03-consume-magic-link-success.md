# UM-AUTH-03 · Consuming a valid magic-link token establishes a session

**Trace:** PRD FR-2 (magic link is the sole login mechanism) · PRD FR-3
(completing seed/import does **not** establish a session — consume is the other
half of that contract) · [DEC-UM-004](../../../architecture/user-management-test-decisions.md)
(single-use; generic `401`) · AD-21 (the real session-issuance/resolution
adapter lands here, retiring `interim-session-resolver.adapter.ts`) ·
[testing-strategy.md](../../../architecture/testing-strategy.md) AD-3 (the
follow-up authenticated request resolves through the **real** AccessControl
facade, not a fake)

> **Reconciled 2026-09-02 (Story 2.2 Stage 1).** Pre-v1.5 wording removed. The
> token is no longer a literal placeholder: Story 2.1 shipped
> `POST /auth/magic-link`, and the Stage-2 recording dispatcher
> (`RecordingMagicLinkDispatcher`, `test/user-management/epic-2/fixtures.ts`)
> records the `{ workEmail, token }` pair it was asked to send — so the suite
> mints a **real** token and reads the raw value out-of-band from that fake,
> exactly as a real inbox would. See the [session-token decisions](README.md#story-22--session-token-decisions-confirm-at-approval).

## Scenario

**Given** Alice is an active employee (seeded per the [canonical personas](README.md#canonical-personas)),
and she has just requested a magic link (`um-auth-01`): `POST /auth/magic-link`
minted one `magic_link_token` row for her — `consumedAt` null, `expiresAt` in
the future — and dispatched the raw token to her `workEmail`.

**When** Alice submits that raw token to `POST /auth/magic-link/consume`.

**Then** the endpoint marks the token consumed and returns `200` with a
**session token scoped to Alice**; the same token can never be consumed again;
and the session token authenticates a real follow-up request.

**Preconditions:** [fixture](README.md#canonical-personas); a valid, unexpired,
unconsumed `magic_link_token` for Alice, minted by a real
`POST /auth/magic-link` call inside this suite (its raw value read from the
recording dispatcher).

## Test

### Test 1 — a valid token establishes a usable session

- **inputURL:** `POST /auth/magic-link/consume`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "" },
    "body": { "token": "<the raw token dispatched to Alice by um-auth-01>" }
  }
  ```
- **expectedResult:**
  - `200`.
  - Body carries a session token scoped to Alice. **Proposed shape (confirm at
    approval — [README §Story 2.2 session-token decisions](README.md#story-22--session-token-decisions-confirm-at-approval)):**
    ```json
    { "sessionToken": "<opaque-or-JWT string>", "tokenType": "Bearer", "expiresIn": 28800 }
    ```
    `expiresIn` is the session lifetime in seconds. No `password`, no user row,
    no `workEmail` echo.
  - After the call, Alice's `magic_link_token` row has `consumedAt` set (a
    non-null timestamp).
- **Follow-up (real AccessControl path — AD-3):**
  `GET /users/<aliceId>` with `Authorization: Bearer <sessionToken>` → `200`.
  The session token resolves through the **real** `SessionResolverPort` adapter
  to `{ userId: aliceId }`, and the **real** `AccessControlFacadeAdapter`
  resolves Alice's `self` audience over her own S1 card — no fake is bound on
  either path (`MAGIC_LINK_DISPATCHER_PORT` is the only rebind).

### Test 2 — the same token cannot be consumed a second time

- **inputURL:** `POST /auth/magic-link/consume`
- **inputRequest:** `{ "headers": { "authorization": "" }, "body": { "token": "<the same raw token>" } }`
- **expectedResult:** `401`; **no** session token anywhere in the body (generic
  denial — DEC-UM-004: not-found / expired / consumed are never distinguished).
  (This is the same rule `um-auth-05` anchors; asserted here too because the
  replay directly follows a real success in one flow.)
