# UMAC-05 · `GET /users/:id` denials — `401` for an unresolved session, `403` for an authenticated viewer with no audience

> **SUPERSEDED FOR THE LIVE ORACLE 2026-09-12 — [`umac-11`](umac-11-hidden-target-denial-oracle.md).**
> The empty-audience `403` in Test 3 below is regenerated there as `404` (PM/AD-24,
> `CONFLICT-UM-01`). The lines below are unchanged historical evidence.

> **SUPERSEDED 2026-09-02 — PM/AD-24.** Historical AD-1 evidence of the 2026-09-01
> empty-audience `403` product decision. Not the live denial oracle.
> Live rule: invalid/inactive session `401`; missing or hidden-existence target
> `404`; visible resource but forbidden action `403`. Do not edit expectedResult
> lines below as if they had always said `404`. Regeneration is a new AD-1 dispatch.

> **CORRECTED 2026-09-06 — mechanism only (PLAT-E4-S4.1c / PLAT-E4-S4.1d).**
> Every `isAllowedForTarget` reference below describes machinery that no longer
> exists. `AccessControlPort` exposes exactly two methods today, `isAllowed` and
> `hasSectionAccess`
> (`services/backend/src/user-management/domain/interfaces/access-control.port.ts:11-33`):
> 4.1c moved `GET /users/:id` onto
> `@RequireSectionAccess('profile:identity', 'read')`
> (`services/backend/src/user-management/application/controllers/users.controller.ts:157-158`)
> and 4.1d then deleted `isAllowedForTarget`, `RequireFeatureForTarget` and
> `AccessControlGuard`'s `targetScoped` branch outright. The `403` this scenario
> asserts is now thrown by `SectionAccessGuard` when
> `hasSectionAccess(viewer, 'profile:identity', 'read', target)` returns `false`
> (`services/backend/src/user-management/application/guards/section-access.guard.ts:53-66`),
> which the adapter answers audience-first — an empty audience resolves `'none'`,
> outranked by `'read'`, so `false`
> (`services/backend/src/user-management/infrastructure/access-control-facade.adapter.ts:63-81`).
> **The scenario, its Given/When/Then and every `expectedResult` below are
> unchanged** — only descriptions of the mechanism are corrected here. Verified
> against backend `ef03c88`.

**Trace:** SPEC-user-management-access-control-adoption CAP-2 (read) · `um-integration-contract-response.md` Q3 (empty set → deny), Q4 (**revised 2026-09-01 by human product decision — no "leak-free 404"; standard REST codes**; **superseded 2026-09-02 by PM/AD-24**), Q6 (the `Bearer <token:Bob>` literal-placeholder trap; adoption fixtures use `Bearer <token:<seeded-uuid>>`) · `access-control.md` §3.2 (identity validation runs **before** any audience derivation — an unconfirmed viewer or target yields an empty audience `Set`, never Self, never the Colleague floor) · `nestjs-di-tokens.md` (~~`AccessControlGuard` is the only sanctioned `ACCESS_CONTROL_PORT` consumer; it already maps a denied `isAllowedForTarget` to `403`~~ — **corrected 2026-09-06 (4.1c/4.1d):** the port has two sanctioned guard consumers, `AccessControlGuard` for the no-target `isAllowed` check and `SectionAccessGuard` for `hasSectionAccess`; the `403` on this route is the latter's, `section-access.guard.ts:53-66`. `nestjs-di-tokens.md:62` itself still names only `SessionGuard`/`AccessControlGuard`) · `testing-strategy.md` AD-1 · `docs/test-cases/README.md`

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
  ~~`AccessControlGuard`~~ the route gate, resolves to an empty audience, and
  surfaces as **`403`** (see below). That interim `403` is acceptable; the target
  end state is `401` once the real session middleware lands.
  **Corrected 2026-09-06:** the guard that produces that `403` is
  `SectionAccessGuard` (`section-access.guard.ts:53-66`), not
  `AccessControlGuard`, since 4.1c. Separately — and **not** decided by this
  correction — `InterimSessionResolverAdapter` no longer exists either: Epic 2
  Story 2.2 replaced it with `JwtSessionResolverAdapter`, whose persona
  shorthand yields `null` for a persona that is not an active `User`
  (`services/backend/src/user-management/infrastructure/jwt-session-resolver.adapter.ts:120-140`),
  so `SessionGuard` raises `401` first
  (`services/backend/src/user-management/application/guards/session.guard.ts:34-39`).
  The committed E2E has already moved to that end state — `UMAC-05 Test 1` and
  `Test 2` assert `401`
  (`services/backend/test/user-management/access-control-adoption/read-denial.e2e-spec.ts:58,74`)
  while the `expectedResult` lines below still read `403`. That divergence is
  **flagged, not resolved here**: re-approving them is a new AD-1 dispatch, so
  the approved lines are left exactly as they stand.
- **Authenticated active viewer, empty audience → `403`.** On this read route
  `colleague` is the audience floor (`umac-04`), so an authenticated active
  viewer only gets an empty audience when the **target** is not an active
  `User`. The response is `403`. **No existence distinction is made** — a
  forbidden target and a missing target both return `403`. ~~This is exactly what
  `AccessControlGuard` produces today from a denied `isAllowedForTarget`~~ —
  **corrected 2026-09-06 (4.1c/4.1d):** this is what `SectionAccessGuard`
  produces from a denied `hasSectionAccess(viewer, 'profile:identity', 'read',
  target)` (`section-access.guard.ts:53-66`); `isAllowedForTarget` is gone from
  `AccessControlPort` (`access-control.port.ts:11-33`). The asserted status is
  unaffected, and **no guard or controller change is in scope** for this story.

There is **no `404` authorization branch** on `GET /users/:id`. The earlier
"leak-free `404`" convention was withdrawn by human product decision on
2026-09-01 (this is an internal employee directory; standard REST codes are
clearer and the existence of a user id is not sensitive).

~~This is the exact case that "passes" under the interim adapter
(`isAllowedForTarget` returns `Boolean(userId)`, so `Boolean('Bob') === true` →
`200`) and must fail under the real facade.~~ **Corrected 2026-09-06.** That
sentence described the pre-adoption interim access-control adapter, which was
already superseded by `AccessControlFacadeAdapter` and whose `isAllowedForTarget`
method 4.1d removed from the port entirely
(`services/backend/src/user-management/domain/interfaces/access-control.port.ts:11-33`);
no code path returns `Boolean(userId)` today. The point the sentence was making
survives in a different mechanism: a `Bearer <token:Bob>` literal never reaches
audience resolution at all, because the persona shorthand resolves only an
active `User` row (`jwt-session-resolver.adapter.ts:120-140`). The `profile.e2e-spec.ts`
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
