# UMAC-01 · Self reads own profile → 200, whole row

**Trace:** SPEC-user-management-access-control-adoption CAP-1 + CAP-2 (read) + CAP-3 · `um-integration-contract-response.md` Q3 (READ_USER_FEATURE, `self` → allow), Q5 (audience-gated not field-gated) · PRD FR-16 · access-control.md §3.2 (Self) · AD-2 · AD-3

## Scenario

**Given** the production `ACCESS_CONTROL_PORT` is bound to the real
`AccessControlFacade`-backed adapter (`interim-access-control.adapter.ts` deleted),
and V is an active seeded `User`.

**When** V calls `GET /users/<V>` with a session for its own id.

**Then** the response is `200` and the body is the **whole `User` row** —
`toUserResponse` spreads every field (`birthDay`, `workPhone`, `ttId`,
`customFields`, `createdBy`, …). V's Phase-0 audience over itself is `self` (after
identity confirmation; Self is exclusive), which the adapter maps to allow for
`user-management:read`.

> **CAP-3 boundary — state it out loud.** An *allowed* `GET /users/:id` returns
> **every** `User` field. The route is **audience-gated, not field-gated**.
> Field/record narrowing (S1 derived-field immutability, colleague S10/S11
> subsets, S16 visibility) is the separate UM-owned **Profile Projection** story
> (FR-17, `deferred-work.md`); this slice does not narrow the body.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); V is an active seeded `User`; the port is rebound (this scenario's E2E fails until `UMAC-1-production` lands).

## Test

- **inputURL:** `GET /users/<V-uuid>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<V-uuid>>" } }
  ```
- **expectedResult:** `200`; body includes every `User` column (assert presence of `id`, `workEmail`, `birthDay`, `workPhone`, `ttId`, `customFields`, `createdBy`) — the route did not narrow it.
