# UMAC-05 · A session whose userId is not an active User → 404 (empty audience, leak-free)

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (read) · `um-integration-contract-response.md` Q3 (empty set → deny), Q4 (empty-audience denial → leak-free `404`), Q6 (the `Bearer <token:Bob>` literal-placeholder trap) · access-control.md §3.2 (identity validation runs before any audience derivation; unconfirmed viewer/target → empty `Set`), "Denial conventions" · `docs/test-cases/README.md`

## Scenario

**Given** the port is rebound; T is an active seeded `User`; and the caller's
session resolves to a `userId` that matches **no active `User` row** — a literal
persona placeholder (`Bearer <token:Bob>` → `{ userId: 'Bob' }`), a deactivated
user, or a well-formed-but-nonexistent id.

**When** the caller calls `GET /users/<T>`.

**Then** the response is **`404`**, leak-free (no field names, counts, or
fragments; it does not confirm whether `<T>` exists).
`AccessControlFacade.resolveAudiences('Bob', [T])` returns an **empty** `Set` for
T — identity validation fails before any derivation, so the viewer is never Self
and never even the Colleague floor. The empty audience is the **only**
`GET /users/:id` denial (every resolvable active viewer is at least a Colleague
and reads the S1 card — `umac-04`). `401` still covers a missing/invalid token.

> **Mechanism — open for the scenario stage, do not default.** `AccessControlGuard`
> maps a denied `isAllowedForTarget` to `ForbiddenException` → `403`. Returning
> `404` here needs the read action (or the controller) to treat an empty audience
> / missing target as `NotFound`. If the approved scenario cannot express `404`
> without a guard change, `403` is the fallback — surface it, don't silently pick
> one.

This is the exact case that "passes" under the interim adapter
(`Boolean('Bob') === true` → `200`) and must fail under the real facade — the
`profile.e2e-spec.ts` `Bearer <token:Bob>` literals break here (see the E2E
audit).

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); T active; caller's `userId` resolves to no active `User`; the port is rebound (this scenario's E2E fails until `UMAC-1-production` lands).

## Test

- **Test 1 — literal placeholder id**
  - **inputURL:** `GET /users/<T-uuid>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `404`, leak-free body. *(Fallback `403` if the mechanism note above resolves that way.)*
- **Test 2 — deactivated caller**
  - **stateChange:** the caller's own `User` row is `isActive: false`.
  - **inputURL:** `GET /users/<T-uuid>` with `Bearer <token:<deactivated-uuid>>`
  - **expectedResult:** `404`, leak-free body.
