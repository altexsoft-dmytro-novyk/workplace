# UMAC-05 · A session whose userId is not an active User → 403 (empty audience)

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (read) · `um-integration-contract-response.md` Q3 (empty set → deny), Q6 (the `Bearer <token:Bob>` literal-placeholder trap) · access-control.md §3.2 (identity validation runs before any audience derivation; unconfirmed viewer/target → empty `Set`)

## Scenario

**Given** the port is rebound; T is an active seeded `User`; and the caller's
session resolves to a `userId` that matches **no active `User` row** — a literal
persona placeholder (`Bearer <token:Bob>` → `{ userId: 'Bob' }`), a deactivated
user, or a well-formed-but-nonexistent id.

**When** the caller calls `GET /users/<T>`.

**Then** the response is `403`. `AccessControlFacade.resolveAudiences('Bob',
[T])` returns an **empty** `Set` for T (identity validation fails before any
derivation — never Self, never the Colleague floor), so the adapter denies
`user-management:read`. This is the exact case that "passes" under the interim
adapter (`Boolean('Bob') === true`) and must fail under the real facade — the
`profile.e2e-spec.ts` `Bearer <token:Bob>` literals break here (see the E2E
audit).

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); T active; caller's `userId` resolves to no active `User`; the port is rebound.

## Test

- **Test 1 — literal placeholder id**
  - **inputURL:** `GET /users/<T-uuid>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `403`.
- **Test 2 — deactivated caller**
  - **stateChange:** the caller's own `User` row is `isActive: false`.
  - **inputURL:** `GET /users/<T-uuid>` with `Bearer <token:<deactivated-uuid>>`
  - **expectedResult:** `403`.
