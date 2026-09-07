# ACM11-FPO-05 · A holder resolving a deactivated or nonexistent target still gets `'none'`

> **New Stage-1 scenario, PLAT-E4-S4.2c (2026-09-07).** This is the CAP-1
> leak-prevention property named explicitly in the architect's solution design,
> re-quoted verbatim below rather than paraphrased, because the exact wording
> is load-bearing: "an unconfirmed/inactive target must stay `'none'`
> regardless of overlay, or the overlay becomes a way to **prove existence**
> of a deactivated or nonexistent user, which is exactly the leak class CAP-1
> and the 404-leak-free rule exist to prevent"
> (`solution-design-full-profile-access-overlay.md` §5.3). Being a §2.4 holder
> must never let a viewer distinguish "this id belongs to a deactivated
> employee" from "this id belongs to nobody" from "this id belongs to an
> active employee I have no relation to" — all three must resolve identically
> to `'none'` for a non-target section, and this scenario proves the
> deactivated/nonexistent pair specifically stays at `'none'` even for the one
> viewer class (§2.4 holders) with the broadest possible read reach.

**Trace:**

- Spec [`spec-4-2c-full-profile-access-overlay.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-2c-full-profile-access-overlay.md) — Always list, "The overlay can only ever move `'none' → 'read'`… it must never be consulted when the target is unconfirmed (CAP-1 leak-prevention: an inactive or nonexistent target must stay `'none'` regardless of who is viewing)."; I/O & Edge-Case Matrix, "Overlay does not apply to an unconfirmed/inactive target" row; Tasks & Acceptance Acceptance Criteria, "Given a holder resolving a deactivated or nonexistent target id (any section), when `canAccessSection` is called, then the result is `'none'`."
- Solution design [`solution-design-full-profile-access-overlay.md`](../../../../_bmad-output/implementation-artifacts/access-control/solution-design-full-profile-access-overlay.md) §5.3 — the CAP-1 leak-prevention sentence quoted above verbatim, and the placement rule it drives: the overlay branch sits **inside** the branch that already survived the `!targetAudiences || targetAudiences.size === 0` early return, never before it.
- `services/backend/src/access-control/application/access-control.facade.ts:81-83` — the existing early return (`if (!targetAudiences || targetAudiences.size === 0) { return 'none'; }`), confirmed by direct read to sit **before** the point Stage 3 inserts the overlay branch (`:85-93`, before `return best;`). A holder never reaches the overlay check for a target this branch has already rejected.
- `services/backend/src/access-control/domain/services/audience-resolver.service.ts:76-82` — "Missing or deactivated target: empty, never Self and never the Colleague floor," confirmed by direct read: `if (!confirmed.has(id)) { audiences.set(id, new Set<Audience>()); continue; }`. This is the mechanism that produces the empty `targetAudiences` set `canAccessSection`'s early return consumes — for both a nonexistent id and a deactivated one, the same branch fires.
- [access-control.md § Audience columns (§3.2)](../../../architecture/access-control.md#audience-columns-32) and [§ Fail-closed, always (AD-11, AD-12)](../../../architecture/access-control.md#fail-closed-always-ad-11-ad-12) — the broader fail-closed discipline this scenario extends to the overlay specifically.
- [`ACM5-SA-07`](../section-access/acm5-sa-07-missing-target-returns-none.md) / [`ACM5-SA-08`](../section-access/acm5-sa-08-empty-audiences-return-none.md) — the pre-existing sibling scenarios proving this same early-return path for a non-holder viewer; this scenario is their holder-viewer counterpart, proving the overlay adds no exception to a rule those two already pin.

## Scenario

**Given** a component-level Nest harness identical in shape to
`ACM11-FPO-03`/`04`: a real `AccessControlFacade` with a real
`FullProfileOverlayService` whose `FullProfileAccessPort` double answers
`isActiveHolder(rootId) → true`. Two target cases, each run against **both**
the real, unmocked `SECTION_ACCESS_MATRIX` (`profile:identity`) and the
`jest.mock`'d synthetic row from `ACM11-FPO-03` — the property must hold for
either matrix, because it is decided before the matrix cell is ever consulted:

1. **Deactivated target** — a User row exists for Dana, but `isActive = false`
   at the time of evaluation.
2. **Nonexistent target** — a well-formed id (`priyaId`, from a prior test run
   or a freshly generated UUID) that matches no `User` row at all.

**When** `AccessControlFacade.canAccessSection(rootId, section, targetId)` is
called for Root (the holder) against each of the two target cases and each of
the two sections.

**Then** every call resolves `'none'` — not `'read'`, even though Root holds
the overlay. `isActiveHolder` is never even reached for these calls: the
existing `!targetAudiences || targetAudiences.size === 0` early return fires
first, because `AudienceResolverService.resolve` never derives an audience
(not `self`, not `colleague`, not anything) for a deactivated or nonexistent
target.

**Preconditions:** migrated PostgreSQL; real `AccessControlModule` wiring for
`resolver` and `functionalRoles`; Root is confirmed active and holds the
overlay per the port double; Dana exists as a `User` row with `isActive = false`;
the nonexistent-target id matches no `User` row in this run's namespace.

## Test 1 — a holder resolving a deactivated target gets `'none'`

- **facadeCall:** `accessControlFacade.canAccessSection(viewerId, section, targetEmployeeId)`
- **input:**
  ```ts
  { viewerId: '<rootId>', section: 'profile:identity', targetEmployeeId: '<danaId (isActive=false)>' }
  ```
- **expectedResult:** `'none'`

## Test 2 — a holder resolving a nonexistent target gets `'none'`

- **facadeCall:** `accessControlFacade.canAccessSection(viewerId, section, targetEmployeeId)`
- **input:**
  ```ts
  { viewerId: '<rootId>', section: 'profile:identity', targetEmployeeId: '<idMatchingNoUser>' }
  ```
- **expectedResult:** `'none'`

## Test 3 — the same two target cases, against the synthetic `'none'`-cell row

- **facadeCall:** `accessControlFacade.canAccessSection(viewerId, section, targetEmployeeId)`
- **input (deactivated target):**
  ```ts
  { viewerId: '<rootId>', section: 'fpo:synthetic-none-cell', targetEmployeeId: '<danaId (isActive=false)>' }
  ```
- **input (nonexistent target):**
  ```ts
  { viewerId: '<rootId>', section: 'fpo:synthetic-none-cell', targetEmployeeId: '<idMatchingNoUser>' }
  ```
- **expectedResult:** `'none'` for both — proves the leak-prevention gate sits
  ahead of the matrix lookup, not merely ahead of a specific real row.
