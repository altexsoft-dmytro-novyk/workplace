---
title: 'PLAT-E4-S4.1c — @RequireSectionAccess gate + identity-card route migration'
type: 'feature'
created: '2026-09-05'
status: 'done'
review_loop_iteration: 0
baseline_commit: 'e0b1a533dc4bcc58024f284c3d996121728e5b68' # services/backend submodule HEAD; 4.1a + 4.1b changes sit uncommitted on top (standing "do not commit" instruction)
context:
  - '{project-root}/docs/architecture/access-control.md'
  - '{project-root}/docs/architecture/nestjs-di-tokens.md'
  - '{project-root}/_bmad-output/implementation-artifacts/platform/story-4-1-generalise-section-access-authorisation.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `AccessControlFacadeAdapter` answers route authorisation by
switching on a *feature string* (`READ_USER_FEATURE` / `EDIT_USER_FEATURE`) and
hand-writing one predicate per section (`canEditS1`). Every new section adds a
branch, and each branch is a place the rule can drift — the 2026-09-03 review
found exactly that drift: `canEditS1` gained an `isAllowed('user-management:edit')`
**OR** clause that *widens* a resolved audience, which the NORMATIVE invariant at
`docs/architecture/access-control.md:19` forbids ("a new functional role never
widens data access ... feature permissions operate **within** the holder's
resolved audiences only").

**Approach:** SCP `sprint-change-proposal-2026-09-04-section-access-consolidation.md`
D3 — one section-parameterised gate. Add
`@RequireSectionAccess('<section>', 'read' | 'write')` (a `SetMetadata`
decorator, exactly the `@RequireFeatureForTarget` idiom already in this codebase)
plus a `SectionAccessGuard` that asks the existing `ACCESS_CONTROL_PORT` seam one
question per route. Per D1 the write requirement is a **dual gate**:
`canAccessSection(viewer, section, target)` must already resolve to `write`
**and** `isAllowed(viewer, '<section>:write')` must hold — the feature half is
satisfied for every active employee by `DEFAULT_PERMISSIONS` (4.1a). Composition
is ordered so the functional half can only ever turn an allow into a deny; it can
never raise a resolved `SectionAccess`. `PATCH /users/:id`, the `GET /users/:id`
`data` read gate, and the `GET /users/:id` `canEdit` hint all move onto that one
question. Only `profile:identity` has a live consumer, so exactly one section is
wired.

## Boundaries & Constraints

**Always:**
- The dual gate for a `'write'` requirement is **audience-first**: resolve
  `canAccessSection` first, deny if it does not already satisfy the required
  level, and only then consult `isAllowed('<section>:write')`. There must be no
  code path in which `isAllowed` produces an allow that the audience half denied
  (`access-control.md:19`). A `'read'` requirement is audience-only — §3.2 decides
  reads by audience and `DEFAULT_PERMISSIONS` holds no `:read` key.
- Level satisfaction is by rank, not equality: `write` satisfies a `'read'`
  requirement; `read` does not satisfy `'write'`; `none` satisfies neither.
- The gate consumes Access Control only through the UM-owned
  `ACCESS_CONTROL_PORT` adapter — no new cross-context coupling, no
  `AccessControlFacade` import outside `user-management/infrastructure/`
  (AD-2 / `nestjs-di-tokens.md:62`: guards are the sanctioned port consumer).
- The `PATCH` gate and the `GET` `canEdit` hint must resolve through **one**
  code path, not two copies of the same composition — the hint is the same
  question the guard asks, answered on a route that is not gated by it.
- Wire `profile:identity` only. `profile:leave` / `profile:projects` exist in
  `SECTION_ACCESS_MATRIX` but no route reads them; adding a decorator for a
  section with no consumer is speculative surface.
- Follow this project's AD-1 discipline: a human-approved scenario doc precedes
  the E2E, and an approved *red* E2E precedes any implementation code. Stop for
  explicit approval between each of the three stages — no dispatch covers more
  than one stage.
- Behaviour for every existing route other than `GET`/`PATCH /users/:id` is
  byte-identical after this story.

**Ask First:**
- ~~The `umac-10` OR-override e2e block flips red the moment the routes move onto
  the dual gate.~~ **RESOLVED 2026-09-05 (Dmytro Novyk, PO) — Reading 1.** 4.1c
  retires the `umac-10` describe block with the reason recorded in Verification;
  its scenario doc gains a superseded-by pointer to `s41c-sag-04` rather than
  being deleted. The OR clause in `canEditS1` stays as unreachable code until
  Story 4.2 removes it — this story's boundary is unchanged.
- Whether the new scenario ids belong in the existing
  `access-control-adoption/` folder (assumed here, following 4.1a's
  `s41a-dp-*`-beside-`acm2-ia-*` precedent) or a new topical folder.

**Never:**
- Never delete `canEditS1`, the `READ_USER_FEATURE` / `EDIT_USER_FEATURE`
  branches in `isAllowedForTarget`, or `S1_SECTION` — that is **4.1d**. This
  story makes them dead; 4.1d removes them.
- Never delete the `user-management:edit` OR-override clause itself, nor touch
  `scripts/dev-grant-root.ts` — that is **Story 4.2**.
- Never add a `DEFAULT_PERMISSIONS` key, change `SECTION_ACCESS_MATRIX`, or
  touch anything under `src/access-control/` — 4.1a and 4.1b own that surface
  and both have landed.
- Never let the guard read `User.position`, a role name, or a policy row
  directly; every decision comes from the port.
- Never introduce a third authorisation idiom — the decorator is `SetMetadata` +
  a `Reflector`-reading guard, same as `require-feature.decorator.ts`.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Reporting-line manager writes | Active V, `Relationship T→V type='direct'`, `PATCH /users/T` | `canAccessSection` → `write`; `isAllowed(V,'profile:identity:write')` → `true` (baseline) → `200` | N/A |
| Assigned PP writes | Active V, `Relationship T→V type='people_partner'`, `PATCH /users/T` | `write` + baseline → `200` | N/A |
| Colleague writes | Active V, no edge to T, `PATCH /users/T` | `canAccessSection` → `read`, rank `1 < 2` → deny before `isAllowed` is called → `403` | `ForbiddenException` |
| Self writes | V `PATCH /users/V` | `self` cell is `read` → `403` (photo stays the Self-only exception) | `ForbiddenException` |
| FR grant holder, colleague audience | Active V holds a live `user-management:edit` grant, no edge to T | `403` — the functional half is never consulted for a denied audience, and its key is not `profile:identity:write` anyway | `ForbiddenException` |
| Any non-empty audience reads | Active V, any of self/colleague/reporting/pp over T, `GET /users/T` | Required `'read'`; resolved `read` or `write` both satisfy → `200` with `{ data, canEdit }` | N/A |
| Empty audience / unknown target reads | Active V, T not an active `User` | `canAccessSection` → `none` → `403` (unchanged from today's empty-audience branch) | `ForbiddenException` |
| `canEdit` hint, colleague viewer | `GET /users/T` by a colleague | `200`, `canEdit: false` — same question as the `PATCH` gate, answered inline | N/A |
| `canEdit` hint, manager viewer | `GET /users/T` by reporting/pp | `200`, `canEdit: true` | N/A |
| Section absent from the matrix | A route declares an unmapped section key | `canAccessSection` → `none` → deny; fail-closed, no throw, no log-and-allow | `ForbiddenException` |

> **Correction 2026-09-05 (Stage-1 finding, John).** The row above originally
> asserted a `403`. That status is **not reachable in 4.1c**: this story wires
> only `profile:identity`, so no route declares an unmapped section, and
> `testing-strategy.md` forbids adding a test-only route to manufacture one.
> The observable assertion is the port returning `false` and the guard
> translating that to `ForbiddenException` — verified in the adapter unit spec
> against a stubbed facade, with the kernel half already covered by
> `acm5-sa-06`. The guard's `false → 403` translation itself IS exercised over
> HTTP by `s41c-sag-02`, so nothing is left unproven; only this row's status
> claim was wrong. `s41c-sag-05` is scoped accordingly.
| Handler with no metadata | Any route without `@RequireSectionAccess` | Guard returns `true` untouched — routes keep whatever gate they already have | N/A |
| Unresolved / inactive session | `Bearer <token:Bob>` on either route | `401` from `SessionGuard`, before this guard runs | Unchanged |

</frozen-after-approval>

## Code Map

- `services/backend/src/user-management/application/decorators/require-section-access.decorator.ts` -- NEW. `RequireSectionAccessMeta { section: string; level: 'read' | 'write' }`, `REQUIRE_SECTION_ACCESS_KEY = 'requireSectionAccess'`, and `RequireSectionAccess(section, level)` = `SetMetadata`. Sibling of `require-feature.decorator.ts`, same shape. (The story says "decorator + guard in `application/guards/`"; the guard lands there, the decorator lands beside the existing decorators — this codebase's convention splits the two, and inventing a second decorator home would be the deviation.)
- `services/backend/src/user-management/application/guards/section-access.guard.ts` -- NEW. Reads the metadata off `context.getHandler()` via `Reflector`; no metadata → `true`. Otherwise reads `request.session.userId` (attached by `SessionGuard`) and `request.params.id`, calls `ACCESS_CONTROL_PORT.hasSectionAccess(viewerId, section, level, targetId)`, and throws `ForbiddenException` on `false` with the same `logger.warn` line shape `AccessControlGuard` already emits.
- `services/backend/src/user-management/domain/interfaces/access-control.port.ts` -- add `export type SectionAccessLevel = 'none' | 'read' | 'write'` and `export type SectionAccessRequirement = 'read' | 'write'` (declared UM-locally; the port must not import the Access Control `SectionAccess` type across the AD-2 boundary), plus one method on `AccessControlPort`: `hasSectionAccess(userId: string, section: string, level: SectionAccessRequirement, targetUserId: string): Promise<boolean>`. `isAllowed` / `isAllowedForTarget` stay as-is (4.1d removes the latter).
- `services/backend/src/user-management/domain/constants/section-keys.ts` -- NEW (new `constants/` dir under UM `domain/`, mirroring `access-control/domain/constants/`). Exports `PROFILE_IDENTITY_SECTION = 'profile:identity'`, the single spelling shared by the controller decorators and the `canEdit` hint. `S1_SECTION` in the adapter is left in place and becomes dead alongside `canEditS1` (deleted by 4.1d) — do not "tidy" it here.
- `services/backend/src/user-management/infrastructure/access-control-facade.adapter.ts` -- implement `hasSectionAccess`: resolve `facade.canAccessSection(userId, section, targetUserId)`, compare against the requirement by a local `SECTION_ACCESS_RANK = { none: 0, read: 1, write: 2 }`, return `false` if the resolved level does not reach the requirement; then, **only** for `level === 'write'`, ``return facade.isAllowed(userId, `${section}:write`)``; `return true` for `'read'`. Repoint `canEditIdentityCard` to `this.hasSectionAccess(viewerId, PROFILE_IDENTITY_SECTION, 'write', targetUserId)` so the hint and the `PATCH` gate are literally one code path. `canEditS1`, `isAllowedForTarget`, and its two branches are left untouched and unreferenced (4.1d).
- `services/backend/src/user-management/domain/interfaces/identity-card-access.port.ts` -- docstring only: the `canEdit` fact is now the `profile:identity` `'write'` dual gate (audience `write` **and** the `DEFAULT_PERMISSIONS`-backed `profile:identity:write` key), not the Variant-A OR-override wording it carries today. Stale prose describing a since-changed contract is worse than none (4.1b precedent).
- `services/backend/src/user-management/application/controllers/users.controller.ts` -- `@Get(':id')` (~line 151): `@RequireFeatureForTarget(READ_USER_FEATURE)` → `@RequireSectionAccess(PROFILE_IDENTITY_SECTION, 'read')`. `@Patch(':id')` (~line 203): `@RequireFeatureForTarget(EDIT_USER_FEATURE)` → `@RequireSectionAccess(PROFILE_IDENTITY_SECTION, 'write')`. Add `SectionAccessGuard` to the controller's `@UseGuards(SessionGuard, AccessControlGuard, SelfOnlyGuard)` list, after `AccessControlGuard`. `READ_USER_FEATURE` / `EDIT_USER_FEATURE` consts become unused here — remove only if lint fails on them, otherwise leave for 4.1d's sweep. `IMPORT_POPULATION_FEATURE` / `LIST_USERS_FEATURE` / `DEACTIVATE_USER_FEATURE` and the `:id/events` + `:id/photo` routes are untouched.
- `services/backend/src/user-management/user-management.module.ts:126` -- register `SectionAccessGuard` in `providers` beside `AccessControlGuard` / `SelfOnlyGuard`; the `ACCESS_CONTROL_PORT` binding is unchanged.
- `services/backend/src/user-management/application/actions/get-user-card.action.ts` -- comment only: the upstream read gate is now `@RequireSectionAccess('profile:identity', 'read')`, not `RequireFeatureForTarget('user-management:read')`. No behaviour change; `IdentityCardAccessService.canEdit` call site is unchanged.
- `services/backend/src/user-management/infrastructure/__tests__/access-control-facade.adapter.spec.ts` -- NEW unit spec (UM convention is `__tests__/`, per `application/actions/__tests__/get-relationships.action.spec.ts`), stubbing `AccessControlFacade`. Covers the rank table, the audience-first ordering (assert `isAllowed` is **not** called when the audience half fails), and the `'read'`-requires-no-feature-half rule. This is where the "feature half denies" branch is observable — see Design Notes.
- Scenario docs, Stage-1 **amendments** (filenames unchanged — stable workboard ids, per 4.1b's boundary): `docs/test-cases/user-management/access-control-adoption/umac-07-write-dual-gate.md` (drop the Variant-A block; the file's own name is finally accurate — restore the dual gate and name the feature half), `umac-10-write-fr-grant-override.md` (mark superseded by the dual gate), `umac-01`..`umac-04` (`canEdit` rationale prose), `access-control-adoption/README.md` (route table + the "`canAccessSection` section string" section, which still says `'S1'`), `docs/test-cases/user-management/profile/um-edit-01-entitled-actor-edits-identity-fields.md`, `um-edit-05-org-fields-in-body-rejected.md`, and `profile/README.md`.
- Scenario docs, Stage-1 **new ids** in `docs/test-cases/user-management/access-control-adoption/` (story-prefixed, following 4.1a's `s41a-dp-*` sitting beside `acm2-ia-*` in one folder): `s41c-sag-01-read-gate-any-audience-allows-none-denies.md`, `s41c-sag-02-baseline-holder-without-write-audience-denied.md`, `s41c-sag-03-write-audience-plus-baseline-allows.md`, `s41c-sag-04-functional-grant-never-widens-audience.md`, `s41c-sag-05-unmapped-section-fails-closed.md`.
- `services/backend/test/user-management/access-control-adoption/s41c-section-access-gate.e2e-spec.ts` -- NEW e2e, written from the approved `s41c-sag-*` docs, reusing `access-control-adoption/fixtures.ts` (real seeded `User` + `Relationship` rows, ids threaded from the fixture — never a hardcoded id).

### Section → endpoint map, as realised in code

| Route | Declaration | Question asked |
|---|---|---|
| `PATCH /users/:id` | `@RequireSectionAccess(PROFILE_IDENTITY_SECTION, 'write')` | `hasSectionAccess(viewer, 'profile:identity', 'write', :id)` |
| `GET /users/:id` (`data`) | `@RequireSectionAccess(PROFILE_IDENTITY_SECTION, 'read')` | `hasSectionAccess(viewer, 'profile:identity', 'read', :id)` |
| `GET /users/:id` (`canEdit`) | not a route gate — `IdentityCardAccessService.canEdit` → `adapter.canEditIdentityCard` | the **same** `hasSectionAccess(viewer, 'profile:identity', 'write', :id)` call |

The map is the decorator line on each handler; there is no separate registry
table to keep in sync. A future section is a new decorator on a new route plus a
`SECTION_ACCESS_MATRIX` row — never a new branch anywhere.

## Tasks & Acceptance

**Execution:**
- [ ] **AD-1 stage 1 — scenario docs only.** Amend `umac-07`, `umac-10`, `umac-01`..`umac-04`, `access-control-adoption/README.md`, `profile/um-edit-01`, `profile/um-edit-05`, `profile/README.md`, and author `s41c-sag-01`..`s41c-sag-05` under `docs/test-cases/user-management/access-control-adoption/`. Resolve the `umac-10` question in the **Ask First** list as part of this stage. **STOP for human approval — write no test file and no source file in this dispatch.**
- [ ] **AD-1 stage 2 — red E2E only.** Write `services/backend/test/user-management/access-control-adoption/s41c-section-access-gate.e2e-spec.ts` strictly from the approved scenario docs; run it against unchanged source and record which cases are red and why (expected: the `s41c-sag-04` invariant case is red — today's OR-override allows it; the audience-half cases are already green under `canEditS1`). **STOP for human approval — write no source file in this dispatch.**
- [x] **AD-1 stage 3 — implementation.** `require-section-access.decorator.ts` -- add the decorator + metadata key.
- [x] `domain/constants/section-keys.ts` -- add `PROFILE_IDENTITY_SECTION`.
- [x] `domain/interfaces/access-control.port.ts` -- add the level types + `hasSectionAccess`.
- [x] `infrastructure/access-control-facade.adapter.ts` -- implement `hasSectionAccess` (audience-first, feature half only for `'write'`); repoint `canEditIdentityCard` at it; update the `identity-card-access.port.ts` docstring.
- [x] `application/guards/section-access.guard.ts` -- add the guard; register it in `user-management.module.ts` and in the controller's `@UseGuards` list.
- [x] `application/controllers/users.controller.ts` -- swap the two `@RequireFeatureForTarget` declarations for `@RequireSectionAccess`; refresh the `get-user-card.action.ts` comment.
- [x] `infrastructure/__tests__/access-control-facade.adapter.spec.ts` -- unit-test the rank table, the audience-first ordering, and the read/write feature-half rule with a stubbed facade.
- [x] Run the regression set in **Verification** and record results here.

**Acceptance Criteria:**
- **Given** an active viewer V with no `Relationship` edge to an active target T (colleague audience only, so `canAccessSection(V, 'profile:identity', T)` is `read`) and V holding `profile:identity:write` implicitly via `DEFAULT_PERMISSIONS`, **when** V sends `PATCH /users/<T>` with a valid identity field, **then** the response is `403` and T's row is unchanged.
- **Given** the same V and T, **when** V sends `GET /users/<T>`, **then** the response is `200` with the `{ data, canEdit }` envelope and `canEdit: false`.
- **Given** V is T's reporting-line manager (`Relationship T→V type='direct'`), **when** V sends `PATCH /users/<T>` with a valid identity field, **then** the response is `200`, the change persists, and a follow-up `GET /users/<T>` returns the new value in `data` with `canEdit: true`.
- **Given** V is T's assigned People Partner (`Relationship T→V type='people_partner'`), **when** V sends `PATCH /users/<T>`, **then** the response is `200` and a follow-up `GET /users/<T>` returns `canEdit: true`.
- **Given** V acts on their own card (self audience → `read`), **when** V sends `PATCH /users/<V>` with a non-photo identity field, **then** the response is `403`.
- **Given** V holds a live `user-management:edit` functional grant but has only a colleague audience over T, **when** V sends `PATCH /users/<T>`, **then** the response is `403` and `GET /users/<T>` reports `canEdit: false` — a functional permission never widens a resolved audience (`access-control.md:19`). *(This is the case that is red before the change.)*
- **Given** any active viewer with any non-empty audience over an active T, **when** they send `GET /users/<T>`, **then** the response is `200` — `write` satisfies the `'read'` requirement as well as `read` does.
- **Given** an active viewer and a target that is not an active `User`, **when** they send `GET /users/<target>`, **then** the response is `403` — identical to today's empty-audience branch.
- **Given** a handler carrying no `@RequireSectionAccess` metadata (`GET /users`, `POST /users/import`, `GET /users/:id/events`, `PUT /users/:id/photo`, `DELETE /users/:id`), **when** it is called, **then** `SectionAccessGuard` returns `true` without a port call and the route's existing gate decides — behaviour byte-identical to before this story.
- **Given** the existing e2e suites `access-control-adoption/read-adoption`, `read-denial`, `no-target-permission`, the `UMAC-07` / `UMAC-08` / `UMAC-09` blocks of `write-adoption`, `epic-1/edit-identity`, and `epic-4/manager-change`, **when** they are run unmodified after this change, **then** every one stays green.
- **Given** the `umac-10` OR-override describe block in `write-adoption.e2e-spec.ts`, **when** it is run after this change, **then** two of its three assertions necessarily fail (the override is no longer consulted) — it must be updated or removed **in this change with the reason recorded in Verification**, per the parent story's "green or updated with a recorded reason" AC. See **Open question for the human**.

## Design Notes

**Why the composition lives in the adapter, not the guard.** `hasSectionAccess`
is one UM-owned question with one answer; putting the rank comparison and the
dual-gate ordering behind the port means the guard (route gate) and
`canEditIdentityCard` (the `canEdit` hint) cannot answer it differently. Splitting
it — guard composes, adapter re-composes — would recreate, in a new place, exactly
the two-copies-of-one-rule problem this story exists to remove. It also keeps the
composition where it already lives today (`isAllowedForTarget` / `canEditS1` are
both adapter code), so the diff is a replacement rather than a relocation, and the
guard stays as thin as `AccessControlGuard`.

**Why `'read'` has no feature half.** D1 makes the *identity-card write* a dual
gate; §3.2 decides reads by audience alone, and `DEFAULT_PERMISSIONS` holds no
`:read` key. If the guard derived `'<section>:<level>'` uniformly it would ask for
`profile:identity:read`, which no one holds, and every read would `403`. The rule
is therefore explicit: the feature half is `'<section>:write'`, consulted only for
a `'write'` requirement. A future read-gated section that genuinely needs a
functional half gets a `DEFAULT_PERMISSIONS` key and an explicit widening of this
rule, decided then — not a speculative parameter now.

**Ordering is the invariant, not a preference.** The guard resolves the audience
half first and returns `false` before `isAllowed` is reached. `isAllowed` can only
subtract. That is `access-control.md:19` expressed mechanically rather than by
convention, and it is the specific defect the 2026-09-03 review found: the current
`canEditS1` calls `isAllowed` *after* a `read` result and lets it win.

**The feature half is not observable over HTTP today.** Every session holder is an
active `User`, and every active user holds `profile:identity:write` via
`DEFAULT_PERMISSIONS`, so no e2e request can exercise "audience says write but the
feature half denies". Its denial branch is covered by 4.1a's
`functional-role-evaluator` unit + e2e specs, and by this story's adapter unit spec
with a stubbed facade. Do not manufacture an e2e for it by mutating the baseline
constant at runtime.

**No new port token.** `hasSectionAccess` joins the existing `AccessControlPort`
rather than getting a `SECTION_ACCESS_PORT` of its own: the adapter behind
`ACCESS_CONTROL_PORT` already implements both this port and
`IdentityCardAccessPort`, one binding answers every route, and a second token
would be a no-op abstraction over the same class.

## Verification

**Run 2026-09-06 at AD-1 stage 3, from `services/backend`. Real output, not
predictions.**

| Command | Result |
|---|---|
| `npm run test -- access-control-facade.adapter` | **PASS** — 1 suite, **21/21** tests |
| `npm run test:e2e -- s41c-section-access-gate` | **PASS** — 1 suite, **19/19** tests (was 3 failed / 16 passed at stage 2) |
| `npm run test:e2e -- write-adoption read-adoption edit-identity manager-change` | **PASS** — 4 suites, **46/46** tests |
| `npm run test:e2e -- read-denial no-target-permission audience-resolution` | **PASS** — 3 suites, **17/17** tests |
| `npm run test:e2e -- test/user-management` | **PASS** — 23 suites, **254 passed / 18 todo / 272 total** |
| `npm run test` (full unit suite) | **PASS** — 5 suites, **44/44** tests |
| `npm run build` | **clean** |
| `npm run lint` | **12 errors, all pre-existing in untouched files** — count unchanged |
| `grep -rn "RequireFeatureForTarget" src/user-management/application/controllers/` | **zero matches** (exit 1) |

**Stage-3 red → green.** The three stage-2 failures were `s41c-sag-04` Tests 1-3
(expected `403`, received `200` — the `canEditS1` OR-override). All three pass
now: `PATCH /users/:id` and the `canEdit` hint resolve through
`hasSectionAccess`, whose audience half returns before `isAllowed` is reached.

**Full e2e sweep (`npm run test:e2e`, 45 suites).** 38 passed, 7 failed — all 7
pre-existing and unrelated to this story, none touching `GET`/`PATCH
/users/:id`:

- `test/mentorship/{pool,pair,view,flag,end,departure}.e2e-spec.ts` — six suites
  whose own describe titles read "Stage-2 committed red"; another story's
  approved red E2E awaiting its stage 3.
- `test/access-control/acm1r-fr-foundation.e2e-spec.ts` — bootstrap/seed
  foundation suite (its first failure is "exposes `db:bootstrap:access-control`
  as an npm script"; no such script exists in `package.json`). Nothing in it
  reaches User Management guards, the adapter, or the two migrated routes.

Both sets are the same files that carry the 12 known pre-existing lint errors.

**Lint — the 12 pre-existing errors, unchanged in count and location.**
`acm1r-fr-foundation.e2e-spec.ts` (1), `acm9-baseline.measurement-spec.ts` (1),
`acm9/manifest.spec.ts` (7), `acm9/manifest.ts` (1), `mentorship/fixtures.ts`
(2). No new error on any file this story touched.

**Known, out of scope.** Suites in `access-control-adoption/` that perform a
successful `PATCH` emit a `user_events_createdBy_fkey` teardown warning —
`fixtures.ts` cleanup deletes `User` rows before the `user_events` rows the edit
wrote. Pre-existing, does not affect any assertion, and shared with other suites;
not fixed here.

### `umac-10` disposition — retired, with reason

The `umac-10` describe block in
`test/user-management/access-control-adoption/write-adoption.e2e-spec.ts` was
**deleted** in this change (3 `it` blocks, formerly at lines 213/229/244), per
the PO's 2026-09-05 Reading-1 decision recorded above. A dated comment block
stands in its place in the spec file so the removal is legible in the suite
itself rather than only in git history.

**Reason.** The block pinned the interim `user-management:edit` OR-override,
which reached the gate only through `isAllowedForTarget(EDIT_USER_FEATURE)` →
`canEditS1`. This story moves `PATCH /users/:id` and the `canEdit` hint onto
`@RequireSectionAccess('profile:identity', 'write')`, so the override is no
longer on any live code path and two of the block's three assertions necessarily
invert: a grant holder whose only audience is `colleague` (Test 1) or `self`
(Test 2) is now `403` / `canEdit:false`, because §3.2 gives both cells `R` and
`access-control.md:19` (NORMATIVE) forbids a functional role from widening a
resolved audience. That is D1 taking effect — the flip restores the normative
rule rather than regressing it.

**Coverage is not lost.** Its intent is superseded by `s41c-sag-04`, which
asserts the opposite deliberately, and its one surviving assertion (Test 3 — a
`'none'` target stays closed to a grant holder) is carried over as `s41c-sag-04`
Test 5. The scenario doc
`docs/test-cases/user-management/access-control-adoption/umac-10-write-fr-grant-override.md`
is **kept**, carrying the dated superseded-by pointer added at stage 1. The dead
`user-management:edit` OR clause in `canEditS1` is **not** deleted here — that
remains Story 4.2's, coupled to seating root in the relationship tree.

### One decision the spec left open, taken here

`test/access-control/audience-resolution.e2e-spec.ts` declares a test-only
`FacadeBackedAccessControlAdapter implements AccessControlPort` and overrides
`ACCESS_CONTROL_PORT`, driving its ACF-AU-01..04 HTTP allow path through
`GET /users/:id`. Adding `hasSectionAccess` to the port made that class fail to
compile, and the route it exercises now enters through the new method. It was
given a `hasSectionAccess` that delegates to the same self/reporting/pp mapping
its `isAllowedForTarget` already used (both now call one private
`hasAllowedAudience`), so the suite's oracle is unchanged and it stays green
(17/17 with `read-denial` / `no-target-permission`). The Code Map did not
anticipate this file; the alternative — leaving it broken — was not an option,
and changing its audience mapping would have altered another context's approved
intent.

## Boundaries

What this story deliberately leaves standing, and who takes it:

| Left in place | Why | Owner |
|---|---|---|
| `canEditS1` (now unreferenced) | Deleting it is a separate, reviewable cleanup; keeping the diff to "add the gate, move two routes" keeps the red→green story legible | **4.1d** |
| `isAllowedForTarget` + the `READ_USER_FEATURE` / `EDIT_USER_FEATURE` branches | Become unreachable here (no route metadata is target-scoped any more), deleted once the gate has shipped green | **4.1d** |
| `S1_SECTION` in the adapter | Only referenced by dead `canEditS1`; removed with it | **4.1d** |
| `RequireFeatureForTarget` decorator + `AccessControlGuard`'s `targetScoped` path | Last usages disappear in this story; the story split does not name them, so they are flagged to 4.1d rather than silently removed here | **4.1d (flagged)** |
| Tests whose names/assertions still say `S1` | 4.1b renamed the live section identifiers; residual naming is 4.1d's sweep | **4.1d** |
| The `user-management:edit` **OR-override clause** in `canEditS1`, and `scripts/dev-grant-root.ts` | The override's deletion is coupled to seating root in the relationship tree; deleting it before that leaves a bootstrapped environment with nobody able to edit anything | **Story 4.2** |
| `resolveAudiences` descend-from-viewer walk (D7) | Performance/shape change tied to the seeded-root model | **Story 4.2** |
| `profile:leave` / `profile:projects` route wiring | No route consumes them; a decorator with no consumer is speculative surface | whichever story wires their first route |
| FR-17 profile projection (field/record narrowing) | This gate decides `none` / `read` / `write` only | deferred FR-17 story |

## Resolved decision — `umac-10` disposition

> **RESOLVED 2026-09-05 by Dmytro Novyk (Product Owner): Reading 1.** 4.1c
> retires the `umac-10` describe block and marks its scenario doc superseded by
> `s41c-sag-04`. The dead `canEditS1` OR clause is NOT touched here — it remains
> Story 4.2's deletion. The analysis below is retained unchanged as the record.

### Original open question

**The `umac-10` OR-override e2e goes red in 4.1c, one story earlier than the
paperwork says.** SCP §4.6 and the parent story both assign the OR-override's
removal to Story 4.2 ("the `write-adoption.e2e-spec.ts` OR-override describe block
added 2026-09-03 is interim and is deleted by Story 4.2"). But the override only
takes effect via `isAllowedForTarget(EDIT_USER_FEATURE)` → `canEditS1`, and this
story moves `PATCH /users/:id` off that path onto the dual gate. From the moment
the decorator swap lands, the override is unreachable, and two of `umac-10`'s
three assertions flip:

- "grant holder with no reporting/PP edge PATCHes an active card → 200,
  `canEdit:true`" → becomes `403` / `canEdit:false`;
- "grant holder edits their OWN card (self, no edge) → 200" → becomes `403`;
- "the override never widens past section access — deactivated target → 403"
  → stays green.

This is not a defect: it is D1 taking effect, and `s41c-sag-04` asserts the
opposite of `umac-10` deliberately. But 4.1c cannot leave the suite red, and it
cannot delete the OR clause (4.2's). Two workable readings, human to pick before
Stage 2:

1. **4.1c retires `umac-10`** — delete the describe block and mark the scenario
   doc superseded by `s41c-sag-04`, recording the reason under the parent story's
   "green or updated with a recorded reason" AC. The dead `canEditS1` clause
   survives untested until 4.2 deletes it.
2. **Pull 4.2's override deletion forward** into 4.1c so code and tests retire
   together — cleaner, but widens this story past its split boundary and touches
   `scripts/dev-grant-root.ts`, which the story explicitly reserves for 4.2.

Reading 1 is assumed throughout this spec. Flagging rather than papering over
because the split as written implies `umac-10` survives 4.1c intact, and it
cannot.

**Verified before the decision (John, 2026-09-05):** `umac-10` has exactly three
`it` blocks (`write-adoption.e2e-spec.ts:213,229,244`); the first two assert
`200`/`canEdit:true` for a viewer whose only audience is `colleague` or `self`.
Requirements §3.2 row S1 gives Self `R (photo RW)` and Colleague `R`, so under
the dual gate both are correctly `403`. The flip restores the normative rule
rather than regressing it. Photo self-upload is a separate route and unaffected.
