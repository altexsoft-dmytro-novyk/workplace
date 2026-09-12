---
status: done-ratified-late
title: 'UMAC-1 Stage 3 — rebind ACCESS_CONTROL_PORT to the real adapter'
type: 'chore'
created: '2026-09-01'
story_id: 'UMAC-1-production'
spec_folder: '_bmad-output/specs/spec-user-management-access-control-adoption'
baseline_revision: '0e703d19150b4727c1f2b42e2f359df9995735dc'
baseline_revision_backend: '94e5a67844f09503ea43f9a1401fa418ff21fb82'
warnings: [profile-v15-write-tests-403]
deferred: []
---

# UMAC-1 Stage 3 — rebind ACCESS_CONTROL_PORT to the real adapter

## Closure (2026-09-12)

**Ratified late.** The work below shipped in `services/backend` `0788f60`
before any Stage-3 approval existed, and inside a 59-file commit that mixed it
with Story 1.1 population import — the exact separation this story's own Note
demanded. Per-artifact Stage-3 records were appended to `approvals.yaml` on
2026-09-12 (author Dmytro Novyk, approver Anna Pikula); read that entry's
header for the scope and basis of the approval.

Two open items below are closed by that record: the `um-pf-01..04` PO call was
resolved by deleting `profile-v15.e2e-spec.ts` in the following commit
`37a339a`, and the four sanctioned-retired suites are likewise gone from the
tree. Both deletions are accepted as intended.

The three Access Control follow-ups listed below are **not** closed. They are
carried by `ACM-8R-scenarios` in the kernel package
(`_bmad-output/specs/spec-access-control-kernel-mvp/stories.yaml`).

## Auto Run Result

**Status: in-review** (superseded the earlier `blocked` — human scope decisions
2026-09-01 relaxed the parity constraint and folded the acm8 / profile-v15 fixes
into this story).

**Implemented.** `ACCESS_CONTROL_PORT` rebound to a real
`AccessControlFacade`-backed adapter; `interim-access-control.adapter.ts` and
`get-user.action.ts` deleted; `GET /users/:id` ships the `{ data, canEdit }`
S1-card envelope; `canEdit` wired through a dedicated
`IDENTITY_CARD_ACCESS_PORT` + `IdentityCardAccessService` seam (no facade
injection into controller/action/guard). Adoption READ suite **12/12 green**
(was 3/12). `tsc` back to the 3 pre-existing `epic-4` errors, no new. All 13
`test/access-control/**` suites pass (incl. the edited acm8).

**Sanctioned e2e regressions (human decision #1 — TEA retires these):**
`registration.e2e` (18), `list.e2e` (10), `deactivation.e2e` (3),
`profile.e2e` (4) — pre-v1.5 suites that relied on the interim adapter's
`position === 'HR Admin'` check / an unseeded test DB.

**⚠️ One regression OUTSIDE the sanctioned set — needs a PO call:**
`test/user-management/epic-1/profile-v15.e2e-spec.ts` `um-pf-01..04` now `403`.
These are write-path tests (`PATCH /users/:id` → 200, `PUT photo` → 200,
duplicate-key → 409) using literal `Bearer <token:Bob/Alice>`. Under the real
facade the target-scoped write gate is fail-closed (correct — the write path is
UMAC-2's) and the persona literals resolve to an empty audience. They cannot go
green without implementing the write path (forbidden here) or a full seeded-UUID
fixture rework (the same rework the e2e audit already assigns to
`profile.e2e-spec.ts`). **Recommendation: treat `um-pf-01..04` as committed-red
pending UMAC-2, or fold their rework into UMAC-2.**

**Follow-ups for the Access Control context (not this story — `src/access-control/**` out of scope):**
- `docs/test-cases/access-control-kernel/.../acm8-kc-02/03-*.md` still describe the old "interim binding unchanged" expectation — realign.
- `src/access-control/access-control.module.ts:12-18` header comment is stale (says the interim adapter is still bound).
- `_bmad-output/implementation-artifacts/access-control/deferred-work.md` #83 / #85 are resolved by this rebind and can be closed.

**Note:** `services/backend` arrived with ~18 pre-existing uncommitted modified
files (`src/access-control/**`, `test/access-control/acm1r|2|3|5`,
`test/measurement/acm9/**`, `test/mentorship/**`,
`test/user-management/epic-4/**`) — NOT from this dispatch. They must be
separated from the UMAC-1 commit.

No git write operation was run. No frontend file was touched.

### This story's files (to commit)

Production — new: `access-control-facade.adapter.ts`, `identity-card-access.port.ts`,
`identity-card-access.service.ts`, `get-user-card.action.ts`, `user-card.response.ts`.
Production — modified: `users.controller.ts`, `user-management.module.ts`.
Production — deleted: `interim-access-control.adapter.ts`, `get-user.action.ts`.
Test — modified: `test/access-control/acm8-kernel-composition.e2e-spec.ts`,
`test/user-management/epic-1/profile-v15.e2e-spec.ts`,
`test/user-management/epic-1/list-v15.e2e-spec.ts`.

---

## Approval verification (done, not assumed)

| Check | Result |
|---|---|
| `UMAC-1-scenarios` / `stage-1-scenarios` — author (`Claude Code (agent)`) != approver (`Dmytro Novyk`) | PASS |
| workspace `5fe0bb86759c350de1d88da710f4f10a09f0431e` resolves + `docs/test-cases/user-management/access-control-adoption/umac-01-self-read-s1-card.md` present at it | PASS |
| workspace `dffe20a5ddae67f9037e2e07cbd0a3bd223fec64` resolves + `umac-01…` and the scenario story spec present at it | PASS |
| `UMAC-1-red-tests` / `stage-2-tests` — author != approver | PASS |
| `services/backend` `08931ad14778f1953ca551c0e25c782afa4ccb1b` resolves + `test/user-management/access-control-adoption/{read-adoption,read-denial,fixtures}` present at it | PASS |
| workspace `00c26e858dc5e6d4b1a7e0bfd55fedc6d95cec71` resolves + `stories/UMAC-1-red-tests-…md` present at it | PASS |

Both approved commits are kept alive by local branches (`umac1-backup`) and are
not ancestors of the current backend HEAD (`94e5a67`); per the dispatch that is
acceptable — "resolves + artifact present" is the check.

---

## Baseline (measured before any change)

`services/backend` @ `94e5a67`, workspace @ `0e703d19`, PostgreSQL `backend-postgres-1` up, `app` DB migrated but **not seeded** (0 users / 0 policies / 0 permissions / 0 AccessControlBootstrap).

- `npx tsc --noEmit` — 3 pre-existing errors, all `TS2345` on a `supertest` body arg in
  `test/user-management/epic-4/{department-change,manager-change,people-partner-change}.e2e-spec.ts`.
- `npm run test:e2e -- test/user-management test/access-control` —
  **19 failed suites / 18 passed / 37 total; 108 failed tests / 175 passed / 283 total.**
  - All 13 `test/access-control/*` suites **pass**.
  - 5 UM suites **pass**: `registration`, `list`, `deactivation`, `profile`, `epic-1/profile-v15`.
  - 19 UM suites fail, including the three approved READ suites in their expected committed-red state:
    - `read-adoption.e2e-spec.ts` — 5 red (`umac-01`, `umac-02` ×2, `umac-03`, `umac-04`) on `expectExactS1CardEnvelope` (body is the whole `User` row, not `{ data, canEdit }`).
    - `read-denial.e2e-spec.ts` — 3 red (`umac-05` T1/T2 expect 403 got 200; T3 expect 403 got 404).
    - `no-target-permission.e2e-spec.ts` — 1 red (`umac-06` Test 4 impostor expects 403, interim allows it).
  - `write-adoption.e2e-spec.ts` (UMAC-2, deferred banner) — red, out of scope.

---

## What the dispatch asks for

1. **CAP-1** — new `src/user-management/infrastructure/access-control-facade.adapter.ts`
   (`@Injectable()`, injects `AccessControlFacade`, implements `AccessControlPort`).
   `isAllowed` delegates straight to `AccessControlFacade.isAllowed`.
   `isAllowedForTarget` for `user-management:read` → `resolveAudiences` non-empty.
   Rebind `ACCESS_CONTROL_PORT` in `user-management.module.ts`; **delete
   `interim-access-control.adapter.ts`** (AD-21).
2. **CAP-3** — `{ data, canEdit }` envelope on `GET /users/:id` only, via a dedicated mapper.
3. Green the three approved READ suites; leave `write-adoption` / `profile` alone.

**Constraints named by the dispatch:** `services/backend` only; do not touch
`src/access-control/**`, `AccessControlPort` signatures, `AccessControlGuard`,
`prisma/` schema, migrations, `seed.ts`; no new route; "pre-existing unrelated
failures … must be identical before/after".

---

## Why this is blocked

Rebinding `ACCESS_CONTROL_PORT` to the real `AccessControlFacade` and deleting the
interim adapter has a blast radius well beyond the three READ suites, and the
dispatch forbids the changes needed to contain it.

### 1. HARD: deleting `interim-access-control.adapter.ts` breaks `tsc` and a passing access-control suite

`services/backend/test/access-control/acm8-kernel-composition.e2e-spec.ts:15`

```ts
import { InterimAccessControlAdapter } from '../../src/user-management/infrastructure/interim-access-control.adapter';
```

- Deleting the file makes this a new `TS2307` error → `npx tsc --noEmit` goes from
  3 pre-existing errors to 4. The dispatch requires `tsc` results with
  baseline parity for pre-existing failures; a brand-new compile error is not that.
- The suite `acm8-kernel-composition.e2e-spec.ts` **passes today** and would fail
  to compile/run. Its `ACM8-KC-02` (`expect(port).toBeInstanceOf(InterimAccessControlAdapter)`)
  and `ACM8-KC-03` (asserts `GET /users/:id` still returns the interim whole-row
  body) assertions are also written to prove the interim binding is *unchanged* —
  they invert on a correct rebind.
- The only fix is editing `test/access-control/**` — which is that context's
  territory and its own tracked item (`_bmad-output/implementation-artifacts/access-control/deferred-work.md`,
  finding #83: "This resolves only when User Management rebinds `ACCESS_CONTROL_PORT`
  to a real facade-backed adapter"). It is not in this dispatch's scope, and the
  dispatch says "Do NOT touch `src/access-control/**`" / "`services/backend` only".

### 2. Rebinding `isAllowed` to the real facade regresses `registration` / `list` / `deactivation` (all green today)

These suites authorize their privileged calls with `Bearer <token:Root>`, which
`InterimSessionResolverAdapter` resolves to whatever `User` row holds
`position: 'HR Admin'` (a bare row they create in `beforeAll`, or a lazily
self-provisioned stand-in). None of them create a functional-role grant chain
(`UserPolicy → Policy(type=FR) → PolicyPermission → Permission`).

- Interim adapter: `isAllowed` = `actor.position === 'HR Admin'` → **allows**.
- Real facade: `PrismaFunctionalRoleRepository.isAllowed` runs a `SELECT EXISTS`
  over the grant chain → **false** for a row with no `UserPolicy`.

Result after the rebind, on the unseeded test DB:

| Suite (passes today) | Regression |
|---|---|
| `test/user-management/registration.e2e-spec.ts` | every `POST /users` via `Bearer <token:Root>` → 403; most `um-reg-*` positive cases fail |
| `test/user-management/list.e2e-spec.ts` | `GET /users` + fixture `POST /users` via `Bearer <token:Root>` → 403 |
| `test/user-management/deactivation.e2e-spec.ts` | `DELETE /users/:id`, fixture `POST /users` → 403; `GET /users/:id` body shape also changes |

There is no in-scope fix: seeding grants in those suites is out of scope (not
one of the three READ suites, arguably UM Epic 1's own concern), and seeding the
test DB globally is forbidden ("`prisma/seed.ts` … not touched").

### 3. The CAP-3 envelope on `GET /users/:id` changes a body that other green suites read

`toUserResponse` stays shared, but `findOne` starts returning `{ data, canEdit }`.
Suites that currently `GET /users/:id` and read top-level fields off the body break:

- `test/user-management/profile.e2e-spec.ts` — **already acknowledged** by the
  dispatch ("Do NOT touch or try to green"); also breaks on `Bearer <token:Bob>` /
  `<token:Alice>` → empty audience → 403.
- `test/user-management/epic-1/profile-v15.e2e-spec.ts` — passes today; asserts
  `GET /users/:id` body fields directly → breaks on the envelope.
- `test/user-management/deactivation.e2e-spec.ts` — reads the post-deactivate
  `GET /users/:id` body.
- `test/access-control/audience-resolution.e2e-spec.ts` — passes today; overrides
  the port with its own facade-backed adapter (so unaffected by the rebind) but
  shares the `findOne` mapper; its `200` paths would see the new envelope.

### Net

Executing the dispatch faithfully turns **≥4 currently-green suites red**
(`registration`, `list`, `deactivation`, `epic-1/profile-v15`; plus `acm8-kernel-composition`
fails to compile) and adds a `tsc` error, while the dispatch's own text only
anticipates the pre-existing `/users/:id/relationships` and `epic-*` `tsc`
failures and only hands off `profile` / `write-adoption`. The "identical
before/after" constraint cannot be met, and the repairs (edit `test/access-control/**`,
seed FR grants into UM Epic 1 suites, or seed the test DB) are each explicitly
outside this dispatch.

---

## What a human needs to decide

1. **`acm8-kernel-composition.e2e-spec.ts` + `deferred-work.md` #83** — who
   updates the access-control suite that asserts the interim binding, and does
   that land with this story or as an access-control dispatch first?
2. **UM Epic 1 authorization suites** (`registration` / `list` / `deactivation`) —
   are they expected to regress here (SPEC Open Decision 5 says "Story 1.2's
   authorization ACs are satisfied by Epic 0"), and if so is greening them with
   seeded FR grants part of this story or a follow-up? This also touches the
   "leave `POST /users` / `DELETE /users/:id` alone" AD-16 note.
3. **Scope of the CAP-3 envelope fallout** — `epic-1/profile-v15` and any other
   green reader of `GET /users/:id` need the same envelope-aware treatment the
   dispatch grants `profile`.
4. Whether to widen this dispatch to "green the 3 READ suites; these N other
   suites are accepted collateral, tracked as <follow-up>" — an explicit
   parity-constraint waiver.

---

## Planned implementation (ready to execute once unblocked)

Recorded so the next dispatch does not re-derive it.

### CAP-1 — `src/user-management/infrastructure/access-control-facade.adapter.ts` (new)

```ts
@Injectable()
export class AccessControlFacadeAdapter implements AccessControlPort {
  constructor(private readonly facade: AccessControlFacade) {}

  isAllowed(userId: string, feature: string): Promise<boolean> {
    return this.facade.isAllowed(userId, feature);
  }

  async isAllowedForTarget(userId: string, feature: string, targetUserId: string): Promise<boolean> {
    if (feature === 'user-management:read') {
      const audiences = await this.facade.resolveAudiences(userId, [targetUserId]);
      const set = audiences.get(targetUserId);
      return set !== undefined && set.size > 0;
    }
    return false; // write-path features are UMAC-2; user-management:edit is unseeded → fail closed
  }
}
```

`AccessControlFacade` is imported from `../../access-control/application/access-control.facade`
(its `application/` public surface, exported by the `@Global AccessControlModule` — AD-2 permits the forward import).

### CAP-3 — `canEdit` wiring

`AccessControlPort`, `AccessControlGuard`, actions, and controllers may not touch
the facade (`nestjs-di-tokens.md` / `domain-driven-design.md`: only
`domain/services/` injects a port; the guard is the one sanctioned
`ACCESS_CONTROL_PORT` consumer). So `canEdit` needs a **second UM-owned port**:

- `src/user-management/domain/interfaces/identity-card-access.port.ts` (new) —
  `IdentityCardAccessPort { canEditIdentityCard(viewerId, targetUserId): Promise<boolean> }`
  + `IDENTITY_CARD_ACCESS_PORT` symbol.
- `AccessControlFacadeAdapter` also `implements IdentityCardAccessPort`:
  `canEditIdentityCard` = `isAllowed(v,'user-management:edit') && canAccessSection(v,'S1',t) === 'write'`
  (both `false`-closed today → `canEdit` always `false`, which the Stage-2 suite asserts).
- New `src/user-management/domain/services/identity-card-access.service.ts` (new) —
  injects `IDENTITY_CARD_ACCESS_PORT` (the mandatory `domain/services/` seam).
- New `src/user-management/application/actions/get-user-card.action.ts` (new) —
  depends on `UserService` + `IdentityCardAccessService`; returns `{ user, canEdit }`,
  throws `NotFoundException` when the row is missing (same as `GetUserAction`).
- New `src/user-management/application/dtos/user-card.response.ts` (new) —
  `toUserCardResponse(user, canEdit)` → `{ data: <12 S1 fields>, canEdit }`.
  `data` = `id, firstName, lastName, photo, position, country, city, workEmail,
  workPhone, birthDay, birthMonth, companyJoinDate` (`companyJoinDate` date-only,
  as `toUserResponse` already does). No `ttId / isActive / customFields /
  createdAt / createdBy`.
- `users.controller.ts` `findOne` → `@CurrentSession() session`, call
  `getUserCardAction.execute(session.userId, id)`, return `toUserCardResponse(...)`.
  `toUserResponse` and the other five call sites unchanged.
- Delete `src/user-management/application/actions/get-user.action.ts` (now unused);
  remove its provider + import.

### Module wiring — `src/user-management/user-management.module.ts`

- Remove the `InterimAccessControlAdapter` import + provider line.
- Add `AccessControlFacadeAdapter` as a provider, plus
  `{ provide: ACCESS_CONTROL_PORT, useExisting: AccessControlFacadeAdapter }` and
  `{ provide: IDENTITY_CARD_ACCESS_PORT, useExisting: AccessControlFacadeAdapter }`.
- Register `IdentityCardAccessService`, `GetUserCardAction`; drop `GetUserAction`.

### Delete (filesystem, not `git rm`)

- `src/user-management/infrastructure/interim-access-control.adapter.ts`

### Verification (once unblocked)

- `npm run lint`, `npx tsc --noEmit` — the latter needs
  `test/access-control/acm8-kernel-composition.e2e-spec.ts` resolved first (see blocker #1).
- `npm run test:e2e -- test/user-management/access-control-adoption/read-adoption.e2e-spec.ts test/user-management/access-control-adoption/read-denial.e2e-spec.ts test/user-management/access-control-adoption/no-target-permission.e2e-spec.ts`
  → expect 12/12 green (was 9 red / 3 green).
- Full `test/user-management` + `test/access-control` e2e, diffed against the
  baseline above — the regressions in blockers #1–#3 must be resolved or
  explicitly waived.

## Code Map

- `services/backend/src/user-management/user-management.module.ts:36` — `{ provide: ACCESS_CONTROL_PORT, useClass: InterimAccessControlAdapter }` (the seam).
- `services/backend/src/user-management/infrastructure/interim-access-control.adapter.ts` — `isAllowed` = `position === 'HR Admin'`; `isAllowedForTarget` = `Boolean(userId)`. Delete at Stage 3.
- `services/backend/src/user-management/application/controllers/users.controller.ts:39-44,81-85` — feature constants; `findOne` → `toUserResponse`.
- `services/backend/src/user-management/application/dtos/user.response.ts:10` — `toUserResponse` (whole-row spread); leave shared, add a dedicated mapper.
- `services/backend/src/user-management/application/guards/access-control.guard.ts:40-53` — target-scoped denial → `ForbiddenException` (403). Unchanged.
- `services/backend/src/access-control/application/access-control.facade.ts` — `isAllowed`, `resolveAudiences`, `canAccessSection(v,'S1',t)`.
- `services/backend/src/access-control/access-control.module.ts:41` — `exports: [AccessControlFacade]`, `@Global`.
- `services/backend/src/access-control/infrastructure/prisma-functional-role.repository.ts:18` — `isAllowed` SQL `EXISTS` over the FR grant chain (the reason bare `position:'HR Admin'` rows no longer pass).
- `services/backend/src/user-management/infrastructure/interim-session-resolver.adapter.ts:43-48` — `Bearer <token:Root>` → the `position:'HR Admin'` row; any other persona → `{ userId: persona }` verbatim. Kept (UM Epic 2).
- `services/backend/test/access-control/acm8-kernel-composition.e2e-spec.ts:15,92-116` — imports + asserts the concrete `InterimAccessControlAdapter` binding. Breaks on delete/rebind.
- `services/backend/test/access-control/audience-resolution.e2e-spec.ts:52-77` — its own `FacadeBackedAccessControlAdapter` override; shares `findOne` mapper.
- `services/backend/test/user-management/{registration,list,deactivation}.e2e-spec.ts` — `Bearer <token:Root>`, no FR grant chain seeded. Green today; regress on rebind.
- `services/backend/test/user-management/access-control-adoption/{read-adoption,read-denial,no-target-permission}.e2e-spec.ts` + `fixtures.ts` — the approved committed-red suite this story must green.
