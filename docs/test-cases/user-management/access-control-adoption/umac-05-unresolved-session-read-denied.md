# UMAC-05 · `GET /users/:id` denials — `401` for an unresolved session, `403` for an authenticated viewer with no audience

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (read) · `um-integration-contract-response.md` Q3 (empty set → deny), Q4 (**revised 2026-09-01 by human product decision — no "leak-free 404"; standard REST codes**), Q6 (the `Bearer <token:Bob>` literal-placeholder trap; adoption fixtures use `Bearer <token:<seeded-uuid>>`) · `access-control.md` §3.2 (identity validation runs **before** any audience derivation — an unconfirmed viewer or target yields an empty audience `Set`, never Self, never the Colleague floor) · `nestjs-di-tokens.md` (`AccessControlGuard` is the only sanctioned `ACCESS_CONTROL_PORT` consumer; it already maps a denied `isAllowedForTarget` to `403`) · `testing-strategy.md` AD-1 · `docs/test-cases/README.md`

## Scenario

**Given** the production `ACCESS_CONTROL_PORT` is rebound to the real
`AccessControlFacade`-backed adapter.

**When** a `GET /users/:id` request is made and **either**:

- the request's session does **not** resolve to an active `User` — no token, an
  invalid token, a literal persona placeholder (`Bearer <token:Bob>` →
  `{ userId: 'Bob' }`), or a caller whose own row is `isActive: false`; **or**
- the caller **is** a valid active `User`, but the **target** id matches no
  active `User` row (inactive or nonexistent), so
  `AccessControlFacade.resolveAudiences(viewer, [target])` returns an empty
  `Set`.

**Then**:

- **Unresolved session → `401`.** Rejecting a request whose session is not an
  active `User` is the **session layer's** responsibility. The Epic 2
  magic-link middleware enforces this. `InterimSessionResolverAdapter` is lax —
  it parses the token into `{ userId: <string> }` without checking the row
  exists or is active — so during the interim such a request reaches
  `AccessControlGuard`, resolves to an empty audience, and surfaces as **`403`**
  (see below). That interim `403` is acceptable; the target end state is `401`
  once the real session middleware lands.
- **Authenticated active viewer, empty audience → `403`.** On this read route
  `colleague` is the audience floor (`umac-04`), so an authenticated active
  viewer only gets an empty audience when the **target** is not an active
  `User`. The response is `403`. **No existence distinction is made** — a
  forbidden target and a missing target both return `403`. This is exactly what
  `AccessControlGuard` produces today from a denied `isAllowedForTarget`, so
  **no guard or controller change is in scope** for this story.

There is **no `404` authorization branch** on `GET /users/:id`. The earlier
"leak-free `404`" convention was withdrawn by human product decision on
2026-09-01 (this is an internal employee directory; standard REST codes are
clearer and the existence of a user id is not sensitive).

This is the exact case that "passes" under the interim adapter
(`isAllowedForTarget` returns `Boolean(userId)`, so `Boolean('Bob') === true` →
`200`) and must fail under the real facade. The `profile.e2e-spec.ts`
`Bearer <token:Bob>` literals (`um-pf-01`..`04`) break here; whether those move
to seeded personas or a tightened scope note is a Stage-2 call
(`um-integration-contract-response.md` Q6), recorded, not resolved here.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); the port is rebound and the S1-card DTO is in place (this scenario's E2E is red until `UMAC-1-production` lands); for Test 1/Test 3, T (resp. the caller) is an active seeded `User`.

## Test

- **Test 1 — session id is not an active User (literal placeholder)**
  - **inputURL:** `GET /users/<T-uuid>`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Bob>" } }
    ```
  - **expectedResult:** `403` under the interim session resolver (the guard denies the empty audience). Target end state once the real magic-link middleware lands: `401`. Body carries no S1 field names, counts, or fragments.
- **Test 2 — deactivated caller (`isActive: false`)**
  - **Preconditions:** the caller is a seeded `User` whose own row is `isActive: false` (static seeded state).
  - **inputURL:** `GET /users/<T-uuid>` with `Bearer <token:<deactivated-caller-uuid>>`
  - **expectedResult:** `403` (interim resolver) — Kernel MVP runtime eligibility includes `User.isActive`, so an inactive viewer resolves to an empty audience. Target end state: `401`.
- **Test 3 — valid active caller, inactive or non-existent target**
  - **Preconditions:** V is an active seeded `User`; the target is either a seeded `User` with `isActive: false` or a syntactically valid id (UUID shape) matching no `User` row.
  - **inputURL:** `GET /users/<target>` with `Bearer <token:<V-uuid>>`
  - **expectedResult:** `403`. `resolveAudiences(V, [<target>])` returns an empty `Set` (target not an active `User`); the guard denies. Identical response for a forbidden target and a missing one — no existence distinction.

> **`401` is the session layer's job.** A missing/invalid `Authorization`
> header is rejected `401` by the session guard before audience resolution
> runs (`docs/test-cases/README.md`). Once the Epic 2 magic-link middleware
> replaces the interim resolver, Test 1 and Test 2 also become `401` (the
> session never resolves). Until then they land on the guard as `403`.
