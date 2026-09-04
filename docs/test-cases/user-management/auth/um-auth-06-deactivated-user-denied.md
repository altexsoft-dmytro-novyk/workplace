# UM-AUTH-06 · Deactivated / departed user cannot establish a session via magic link

**Trace:** epics.md Story 2.2 · PRD FR-6 (once a departure effective date has
passed and the account is inactive, no usable session is established) ·
[DEC-UM-004](../../../architecture/user-management-test-decisions.md) (generic
`401`) · [DEC-UM-012](../../../architecture/user-management-test-decisions.md)
(proposed — request-side enumeration safety, owned by
[`um-auth-02b`](um-auth-02b-request-magic-link-deactivated-email.md))

> **Scope note (2026-09-02).** The **request half** (a deactivated address is
> enumeration-safe on `POST /auth/magic-link`) lives in its own Story 2.1 file
> [`um-auth-02b`](um-auth-02b-request-magic-link-deactivated-email.md). This
> file owns **only** the consume half: a token minted *before* deactivation
> must not yield a session, because the account-state check happens **at
> consume time** against the current `User.isActive` / current
> `EmploymentStatus` — independent of the DEC-UM-012 draft.

> **Reconciled 2026-09-02 (Story 2.2 Stage 1).** Real token. Because a
> deactivated address gets **zero** dispatch (`um-auth-02b`), the token cannot
> be minted after deactivation — so the suite mints it while Colin is still
> active, reads the raw value from the recording dispatcher, then flips
> `isActive: false` **and** seeds a current `EmploymentStatus{dismissed}`
> directly (the applied-departure convergence; in production an Epic 5 outcome,
> CC-06-blocked). The pre-existing token is then submitted to `/consume`.

## Scenario

**Given** Colin was an active employee who requested a magic link
(`POST /auth/magic-link` minted and dispatched a real token), and **after that**
his departure took effect: his `User` row is now `isActive: false` **and** he
has a current `EmploymentStatus{status: 'dismissed'}` (both seeded directly at
Stage 2).

**When** someone submits Colin's still-unexpired, still-unconsumed
pre-deactivation token to `POST /auth/magic-link/consume`.

**Then** no usable session is established — a deactivated / departed account must
not authenticate through the magic-link path, and the denial is
enumeration-safe (the generic `401`, revealing nothing about account state).

**Preconditions:** [fixture](README.md#canonical-personas) (Colin); a real
`magic_link_token` for Colin, minted while active, `consumedAt` null,
`expiresAt` in the future; Colin's row flipped to `isActive: false` with a
current `dismissed` employment status afterward.

## Test

- **Test 1 — request is enumeration-safe (DEC-UM-012, proposed) — MOVED**
  - Owned by Story 2.1's [`um-auth-02b`](um-auth-02b-request-magic-link-deactivated-email.md):
    `POST /auth/magic-link` for a deactivated address → byte-identical
    `200 { sent: true }`, zero dispatch, no token minted. Not re-asserted here.
- **Test 2 — a pre-deactivation token must not yield a session**
  - **inputURL:** `POST /auth/magic-link/consume`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "" },
      "body": { "token": "<the raw token minted for Colin while active>" }
    }
    ```
  - **expectedResult:**
    - `401` (the generic denial — DEC-UM-004).
    - **No** session/access token in the body **and no** `Set-Cookie` header —
      no session material leaves the endpoint by any channel.
    - Enumeration-safe: the response is indistinguishable from the not-found /
      expired / already-consumed cases.
