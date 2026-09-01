# UMAC-05 · An unresolvable identity on `GET /users/:id` (viewer or target not an active User) → 404 (empty audience, leak-free)

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (read) · `um-integration-contract-response.md` Q3 (empty set → deny), Q4 (empty-audience denial → leak-free `404`; `401` still covers a missing/invalid token), Q6 (the `Bearer <token:Bob>` literal-placeholder trap; adoption fixtures use `Bearer <token:<seeded-uuid>>`) · `access-control.md` §3.2 (identity validation runs **before** any audience derivation — an unconfirmed viewer or target yields an empty audience `Set`, never Self, never the Colleague floor), "Denial conventions" (`401` / `403` / leak-free `404`) · `nestjs-di-tokens.md` (`AccessControlGuard` is the only sanctioned `ACCESS_CONTROL_PORT` consumer — the `404`-vs-`403` mechanism note below turns on guard vs. read-action responsibility) · `testing-strategy.md` AD-1 · `docs/test-cases/README.md`

## Scenario

**Given** the production `ACCESS_CONTROL_PORT` is rebound to the real
`AccessControlFacade`-backed adapter, and **either**:

- the **caller's** session resolves to a `userId` that matches no active `User`
  row — a literal persona placeholder (`Bearer <token:Bob>` →
  `{ userId: 'Bob' }`), or a caller whose own row is `isActive: false`; **or**
- the **target** id in the path matches no active `User` row (well-formed but
  nonexistent), while the caller is a valid active `User`.

**When** the request is `GET /users/<T>` (or `GET /users/<missing>`).

**Then** the response is **`404`** with a **leak-free body** — no field names,
counts, or fragments, indistinguishable from a truly nonexistent resource; it
does not confirm whether the target exists.
`AccessControlFacade.resolveAudiences(viewer, [target])` returns an **empty**
`Set` for that target — identity validation fails before any derivation, so the
viewer is never Self and never even the Colleague floor. An empty audience is the
**only** `GET /users/:id` denial: every resolvable active viewer over an active
target is at least a Colleague and reads the S1 card (`umac-04`). A
missing/invalid token is a separate case → **`401`** (global rule,
`docs/test-cases/README.md`), not `404`.

> **Mechanism — flagged OPEN for the human, do not default.**
> `AccessControlGuard` today maps a denied `isAllowedForTarget` to
> `ForbiddenException` → `403` (`access-control.guard.ts`). Producing the
> leak-free `404` for an unresolved identity **without changing the guard**
> needs a controller/read-action decision — the `GET /users/:id` handler (or
> `GetUserAction`) treats an empty audience / missing target as `NotFound`.
> This story does **not** pick the mechanism and proposes **no**
> `AccessControlGuard` change as in-scope. If the approved scenario cannot
> express `404` without a guard change, `403` is the recorded fallback — the
> reviewer decides. (SPEC "Never": no `AccessControlGuard` change proposed as
> in-scope.)

This is the exact case that "passes" under the interim adapter
(`isAllowedForTarget` returns `Boolean(userId)`, so `Boolean('Bob') === true` →
`200`) and must fail under the real facade. The `profile.e2e-spec.ts`
`Bearer <token:Bob>` literals (`um-pf-01`..`04`) break here; whether those move
to seeded personas or a tightened scope note is a Stage-2 call
(`um-integration-contract-response.md` Q6), recorded, not resolved here.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); the port is rebound and the S1-card DTO is in place (this scenario's E2E is red until `UMAC-1-production` lands); for Test 1/Test 3, T (resp. the caller) is an active seeded `User`.

## Test

- **Test 1 — caller session id is not an active User (literal placeholder)**
  - **inputURL:** `GET /users/<T-uuid>`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Bob>" } }
    ```
  - **expectedResult:** `404`, leak-free body (no field names, counts, or fragments). *(Recorded fallback: `403` if the flagged mechanism note resolves that way.)*
- **Test 2 — deactivated caller**
  - **Preconditions:** the caller is a seeded `User` whose own row is `isActive: false` (static seeded state).
  - **inputURL:** `GET /users/<T-uuid>` with `Bearer <token:<deactivated-caller-uuid>>`
  - **expectedResult:** `404`, leak-free body. Kernel MVP runtime eligibility includes `User.isActive`, so an inactive viewer resolves to an empty audience.
- **Test 3 — valid active caller, well-formed non-existent target**
  - **Preconditions:** V is an active seeded `User`; `<missing>` is a syntactically valid id (UUID shape) that matches no `User` row.
  - **inputURL:** `GET /users/<missing>` with `Bearer <token:<V-uuid>>`
  - **expectedResult:** `404`, leak-free body — identical in shape and content to Test 1, so a caller cannot distinguish "target does not exist" from "you may not see this target". `resolveAudiences(V, ['<missing>'])` returns an empty `Set` for `<missing>` (target identity unconfirmed).

> **The `401` boundary is the global rule, not a numbered row here.** A
> missing/invalid `Authorization` header is rejected `401` by the session guard
> before audience resolution runs; every endpoint family carries that check
> (`docs/test-cases/README.md`). It is called out to distinguish it from the
> empty-audience `404` above — the two must never be merged.
