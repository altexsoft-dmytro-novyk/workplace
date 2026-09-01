# E2E Actual-State Audit — User Management ↔ Access Control (v1.5)

**Date:** 2026-09-01 · **Author:** TEA phase (planning/prose only — no code, no
`services/backend/` edit, no commit) · **Scope:** the pre-v1.5 stage-2 E2E specs
under `services/backend/test/user-management/` and `services/backend/test/access-control/`,
plus a read-only inventory of `services/backend/src/user-management/`.

**Backend submodule state audited:** branch `dn-um-2`, HEAD `e9d80ec`
(`docs(access-control): record why acm8-kernel-composition imports User
Management internals`). This branch carries **both** the pre-v1.5 UM stage-2
specs **and** the full Access Control Kernel MVP (ACM-0..ACM-9) — so
`test-summary.md`'s "no `user-management` controllers exist yet, tests 404" note
is **stale**: `users.controller.ts` and its actions exist and are wired.

---

## 0. Is the UM module wired into `AppModule`? — YES

`services/backend/src/app.module.ts:8,20` imports `UserManagementModule`.
`AccessControlModule` is also imported (`:19`, ACM-8) and is `@Global`.
`user-management.module.ts:36` still binds `{ provide: ACCESS_CONTROL_PORT,
useClass: InterimAccessControlAdapter }` and `:35` binds
`InterimSessionResolverAdapter`.

So the `test-summary.md` claim "23/23 new tests fail on 404 (no route yet)" was
true when written and is **now wrong**. Current reality:

| Route family | Controller | Status |
| --- | --- | --- |
| `GET/POST /users`, `GET/PATCH/DELETE /users/:id`, `PUT /users/:id/photo` | `users.controller.ts` | **built** — specs that use only these run for real |
| `POST /auth/magic-link[/consume]` | none | **not built** → `auth.e2e-spec.ts` 404s |
| `GET/POST/DELETE /users/:id/events` | none | **not built** → `career-timeline.e2e-spec.ts` 404s |
| `POST/DELETE /users/:id/relationships`, `PUT .../people-partner` | none | **not built** → `relationships.e2e-spec.ts` 404s |

Schema (`prisma/schema.prisma`): `User`, `Relationship`, `Project`, `Policy`,
`Permission`, `PolicyPermission`, `UserPolicy`, `AccessControlBootstrap`. **No
`UserEvents`/`UserEvent` model, no magic-link-token model** — the career-timeline
and auth suites are blocked on schema work as well as controllers.

---

## 1. `services/backend/test/user-management/*` — verdict table

| Spec file | v1.5 verdict | Detail |
| --- | --- | --- |
| `registration.e2e-spec.ts` | **RETIRE (contradicts v1.5)** | 15 `describe` blocks `um-reg-01..15`, all exercising `POST /users` create (`:86-603`). v1.5 has no `POST /users` (AD-14/AD-16/§4.17). The whole file is retired with `docs/test-cases/user-management/registration/`. Its `createUser()` helper (`:68-84`) is the `POST /users` fixture pattern the other suites copied — it must be replaced with a seed/import fixture everywhere it was borrowed. |
| `profile.e2e-spec.ts` | **STALE-FIXTURE rework (major)** | `um-pf-01..04` (`:61-174`). Two problems: (a) fixtures are built with `createUser()` → `POST /users` (`:22-38`) — must become seed/import fixtures; (b) `Bearer <token:Bob>` / `<token:Alice>` literals (`:75,83,103,133,163`) resolve through `InterimSessionResolverAdapter` to `{ userId: 'Bob' }` — the non-existent string id. Today `isAllowedForTarget` returns `Boolean('Bob') === true`, so `um-pf-01/02` get `200` and `um-pf-03/04` reach the `409` logic. **Under the real facade (Epic 0) `'Bob'` → empty audience → `403`** before any of that (`um-integration-contract-response.md` Q6). Needs real seeded UUIDs + real `Relationship` rows (`direct` for the manager case, `people_partner` where relevant, viewer==target for Self). The scenario prose was realigned this pass to "data correctness given an entitled actor"; the E2E rework itself is Epic 0 Story 0.1's scenario-stage call (flagged, not silently rewritten). |
| `deactivation.e2e-spec.ts` | **RETIRE (contradicts v1.5)** | `um-deact-01..03` (`:61-132`) exercise `DELETE /users/:id` generic deactivation — removed in v1.5 (AD-16). `um-deact-02`'s surviving behaviour (dismissed employee absent-by-default-but-filterable) moves to `list/um-list-05` and a Story-1.5 spec; the mechanism (`DELETE /users/:id`) does not survive. Retired with the folder. `um-deact-03`'s Ida-`403` capability-granularity idea carries into `umac-06`. |
| `list.e2e-spec.ts` | **STALE-FIXTURE rework (minor) + MISSING** | `um-list-01..04` (`:81-302`). Fixtures via `createUser()` → `POST /users` (`:33-49`) — must become seed/import fixtures. Query params, envelope handling, and `Bearer <token:Root>` are fine (Root is a no-target `user-management:list` check, unaffected by the target-scoped adapter). **MISSING:** no test for `um-list-05` (dismissed-employee filterable) — authored this pass as a scenario; its E2E replaces the retired `um-deact-02`. Trace fix: the file/scenarios cite `FR-16` for "list" — v1.5 `FR-16` is the *adoption* requirement; list is `FR-15` (corrected in the scenario docs this pass). |
| `auth.e2e-spec.ts` | **STALE-FIXTURE rework + BLOCKED (not built)** | `um-auth-01..06` (`:61-220`). `createUser()` → `POST /users` (`:22-38`) must become seed/import fixtures. `POST /auth/magic-link[/consume]` is not built → every test 404s today. `um-auth-06` references `um-deact-01` for the inactive state — that path is retired; stage 2 seeds `isActive:false` directly (Epic 5 / CC-06 blocks the real departure route). Scenario prose is otherwise v1.5-OK (DEC-UM-004/012). The magic-link token stays a literal placeholder (no HTTP seam) — correct. |
| `career-timeline.e2e-spec.ts` | **STALE-FIXTURE rework + BLOCKED (not built) + realign actors** | `um-ct-01..08` across 11 `it`s (`:70-300`). `createUser()` → `POST /users` (`:31-47`); `um-ct-01`'s "creating a user writes joined_company" must become "the seeded import writes joined_company" (scenario retraced to `seed/um-seed-01` this pass). `/users/:id/events` + `UserEvents` model not built → all 404 today. **Actor realignment:** the spec's `describe` titles already say "PP" (`um-ct-03`, Paula) and "Unit Manager" (`um-ct-04`, Bob) — consistent with DEC-UM-001 — but there is **no test for the two dual-gate negatives** (permission without S9 write; S9 write without permission) that `epics.md` Story 3.2/3.3 require. Authored as `um-ct-09`/`um-ct-10` scenarios this pass. **S9 `canAccessSection` is a pending Access Control increment** (ACM-5 ships S1/S10/S11 only) — the S9-write half of the dual gate has no facade call yet; stage-2 for `um-ct-03..10` is partially AC-blocked. |
| `relationships.e2e-spec.ts` | **RETIRE the mentorship half + STALE-FIXTURE rework + BLOCKED (not built) for the rest** | `um-rel-01..08` (`:95-267`). `/users/:id/relationships` not built → all 404. `um-rel-04/05/06` (mentorship pair/unpair/multiple mentors, `:147-223`) — **RETIRE**: mentorship pair lifecycle left UM (AD-17); superseded headers on the scenario docs. `um-rel-01/02/03/08` (reports-to) — keep, retraced to Epic 4 Story 4.1; the atomic-journal assertions those tests would need are **stage-2 blocked on CC-07** (AD-19 Journal gate). `um-rel-07` (non-HR-Admin denied) retraced to the single *change organisational relationships* permission (no-target facade `isAllowed`, never a role-name check). **MISSING:** PP-change (`um-rel-09..11`, Story 4.2 — BLOCKED CC-04+CC-07) and department-change (`um-rel-12..14`, Story 4.3 — BLOCKED CC-07+Department edge) — authored as scenario stubs this pass, not translatable to E2E. Fixture `createUser()` → `POST /users` (`:38-54`) must become seed/import. |
| `_bmad-output/implementation-artifacts/user-management/tests/test-summary.md` | **STALE — supersede** | Claims "no `user-management` controllers exist yet", "23/23 fail on 404", "24/24 docs transcribed". All three are out of date: controllers exist for the `/users` family; only auth/events/relationships routes 404; the v1.5 doc set is now ~52 live files. It also lists `registration.e2e-spec.ts` as "story 1-1 in progress" — story 1.1 is now the seeded import, no HTTP create. This file should get a superseded header pointing at this audit and the v1.5 test-cases README. |

### 1a. Which UM specs currently pass vs fail (interim adapter, HEAD `e9d80ec`)

| Spec | Now | Reason |
| --- | --- | --- |
| `registration.e2e-spec.ts` | mostly **PASS** | `POST /users` built; `InterimAccessControlAdapter.isAllowed` allows `Bearer <token:Root>` via `position === 'HR Admin'`; Ida → `403`. |
| `profile.e2e-spec.ts` | **PASS** | `isAllowedForTarget` returns `Boolean('Bob')` = `true`. **This is the read leak** — every session passes. |
| `deactivation.e2e-spec.ts` | **PASS** | `DELETE /users/:id` built; Root allowed, Ida `403`. |
| `list.e2e-spec.ts` | **PASS** (permissive assertions) | `GET /users` built; Root allowed. |
| `auth.e2e-spec.ts` | **FAIL (404)** | routes not built. |
| `career-timeline.e2e-spec.ts` | **FAIL (404)** | `/users/:id/events` + `UserEvents` model not built. |
| `relationships.e2e-spec.ts` | **FAIL (404)** | `/users/:id/relationships` not built. |

The pre-existing failures (`auth`, `career-timeline`, `relationships`) are the
"not-yet-built" ones the adoption SPEC's `UMAC-1-production` invoke text says must
be "identical before and after" the port rebind.

---

## 2. `services/backend/src/user-management/*` — AD-21 cutover inventory (findings only, no change)

| File / element | Disposition | Owner |
| --- | --- | --- |
| `infrastructure/interim-access-control.adapter.ts` | **DELETE** in the same change that binds the real adapter (AD-21, no dual-running). `isAllowed` does `actor?.position === 'HR Admin'` (`:26-27`) — prohibited by AD-4 / `access-control.md:49`. `isAllowedForTarget` returns `Boolean(userId)` (`:37-39`) — the read leak. | Epic 0 Story 0.1 (`UMAC-1`) |
| `user-management.module.ts:36` `{ provide: ACCESS_CONTROL_PORT, useClass: InterimAccessControlAdapter }` | **REBIND** to a new `@Injectable()` `src/user-management/infrastructure/access-control-facade.adapter.ts` that injects `AccessControlFacade` forwards across the AD-2 boundary. `isAllowed` → `facade.isAllowed`; `isAllowedForTarget('user-management:read', …)` → `facade.resolveAudiences(v,[t])` membership of `self`/`reporting`/`pp`. | Epic 0 Story 0.1 |
| `application/controllers/users.controller.ts:40,41,42` constants `EDIT_USER_FEATURE='user-management:edit'`, `READ_USER_FEATURE='user-management:read'`, `UPLOAD_PHOTO_FEATURE='user-management:upload-photo'` | Reference **permission keys that exist in no seed, policy, or migration.** `user-management:read` is only used as a target-scoped audience gate (fine — the adapter maps it to `resolveAudiences`). `user-management:edit` / `:upload-photo` cannot pass `facade.isAllowed` — **Open Decision (i)** (add via a kernel seed AD-1 sequence, or an interim rule with an expiry trigger). | Epic 0 Story 0.2 (`UMAC-2`, CONDITIONAL) + (option a) an Access Control kernel seed story |
| `application/dtos/update-user.dto.ts` | Carries `@IsEmpty()` on `photo`, `isActive`, `id`, `createdAt`, `createdBy` (`:69-82`) but **no `manager` / `peoplePartner` / `department` fields at all** — so those are *silently stripped* by `whitelist:true`, not *rejected*. `um-integration-contract-response.md` Q3 step 3 requires an **explicit** rejection (`400`) — add `@IsEmpty()` for those keys and a test (`umac-08`). | Epic 0 Story 0.2 / Epic 1 Story 1.2 |
| `application/actions/edit-user.action.ts` | Only copies scalar S1 fields into the patch (`:17-31`) — no org fields reach the repo today. Still needs the explicit §3.2 fn 1 rejection surfaced to the client (see DTO row). | Epic 0 Story 0.2 |
| `application/actions/register-user.action.ts` + `users.controller.ts:72-79` (`POST /users`) + `CreateUserDto` | **AD-21 removal**, owned by **Epic 1** (AD-16). Not Epic 0's — the adoption SPEC Non-goals say "this slice must not be blocked by them and must not remove them". Retire when Story 1.1's seeded import lands. | Epic 1 Story 1.1 |
| `application/actions/deactivate-user.action.ts` + `users.controller.ts:109-113` (`DELETE /users/:id`) | **AD-21 removal**, owned by **Epic 1 / Epic 5** — generic deactivation is retired (AD-16); the v1.5 lifecycle is the Epic 5 departure workflow. | Epic 1 / Epic 5 |
| `infrastructure/interim-session-resolver.adapter.ts` | **KEEP** for now — retired by **Epic 2** (Magic-Link Authentication), not Epic 0. Epic 0's fixtures use the `Bearer <token:<seeded-uuid>>` convention it already supports (`:48`, `{ userId: persona }`). AD-21's interim-adapter clause is about the *access-control* adapter, not the session resolver. | Epic 2 Story 2.2 |
| `infrastructure/magic-link-dispatcher.fake.ts` + `MAGIC_LINK_DISPATCHER_PORT` binding | Legitimate outbound-integration fake (`nestjs-di-tokens.md`). Stays a fake; the real dispatcher is Epic 2. Not an AD-21 concern. | Epic 2 |

---

## 3. `services/backend/test/access-control/*` — ACM-0..ACM-8 mapping + the ACM3-II-06 gap

### 3a. Suites exist and map to `approvals.yaml`

14 spec files, 99 cases (`e2e-trace-summary.json`). All ACM groups present:
`acm0-root-user-prerequisite`, `acm1r-fr-foundation`, `acm2-is-allowed`,
`acm3-{cycle-acyclicity, fail-closed-identity, inactive-identity,
inactive-pp-endpoint, path-local-visited-state, termination-taxonomy}`,
`acm4r-multi-audience`, `acm5-section-access`, `acm8-kernel-composition`,
`audience-resolution`. `spec-access-control-kernel-mvp/approvals.yaml` records
`ACM-3-scenarios` stage-1 for `ACM3-II-01..03` (early) and `ACM3-II-04..14`
(commit `e42fd2d`), and `ACM-3-red-tests` stage-2 for
`acm3-inactive-identity.e2e-spec.ts`. ACM-2/ACM-5/ACM-8 have
`stage-3-production` records (`um-integration-contract-response.md` preamble).

### 3b. ACM3-II-06 — the P0 trace-gate FAIL, documented precisely

**Gate:** `gate-decision.json` → `gate_status: FAIL`, `p0_status: NOT_MET`,
"P0 coverage is 95% (required: 100%). 1 critical requirement(s) uncovered:
ACM3-II-06."

**The three parts of the gap:**

1. **Stage-1 scenario is approved.** `docs/test-cases/access-control-kernel/inactive-identity/acm3-ii-06-repeat-before-viewer-proof.md`
   **exists and is recorded approved** in `approvals.yaml` (`story_id:
   ACM-3-scenarios`, `artifact_path:
   docs/.../acm3-ii-06-repeat-before-viewer-proof.md`, `commit:
   e42fd2d111ecab7e4cbddb9680c47ecdfbc2edc9`). The scenario is fully specified —
   two-node cycle `Kai ⇄ Lena` above target `Rhea`, off-chain viewer `Sasha`,
   clean-chain control target `Tess`; expected `Rhea → {'colleague'}`,
   `Tess → {'reporting'}`; asserts completion inside the adapter's 2-second
   statement timeout.

2. **No Stage-2 committed(-red-then-green) test exists.** `traceability-matrix.md`
   line 136: `ACM3-II-06 … **NONE**`. Inspection confirms
   `acm3-cycle-acyclicity.e2e-spec.ts` has `describe` blocks for **`ACM3-II-07`
   and `ACM3-II-08` only** (`:175,207`); its own header (`:9-13`) says "the two
   approved scenarios the first Stage-2 suite does not: ACM3-II-07 … and
   ACM3-II-08." II-06 is nowhere in the suite.

3. **A false coverage comment.** `acm3-termination-taxonomy.e2e-spec.ts:23-24`:
   > `* Scope: these two scenarios only. ACM3-II-06/07/08 are covered in`
   > `* acm3-cycle-acyclicity.e2e-spec.ts and are not restated here.`
   The `06` in "ACM3-II-06/07/08" is wrong — `acm3-cycle-acyclicity` covers only
   07/08. This is `traceability-matrix.md` Finding **TRACE-1** (documentation
   defect, not a behavior defect).

**Remediation (top item — a separate follow-up, NOT this no-code pass):**

> Dispatch a scoped **Stage-2 AD-1 sequence for `ACM3-II-06`**: a new
> committed-red-then-green spec file (e.g.
> `test/access-control/acm3-repeat-before-viewer-proof.e2e-spec.ts`) exercising
> the real `AccessControlFacade` against real migrated PostgreSQL with the
> approved fixture (`Rhea → Kai ⇄ Lena` cycle, off-chain `Sasha`, control
> `Tess`), asserting `Rhea → Set{'colleague'}`, `Tess → Set{'reporting'}`, and
> completion well inside the 2s statement timeout — following the exact pattern
> of the sibling II-07..14 tests. **And** fix the false cross-reference at
> `acm3-termination-taxonomy.e2e-spec.ts:23`. This is `author != approver`,
> recorded in `spec-access-control-kernel-mvp/approvals.yaml`. It is **code
> work** and therefore out of scope for this TEA planning pass — it is the
> single item blocking the Kernel MVP trace gate.

**Two MED recommendations (do not block the gate on their own, but II-04 and
II-05 are also P0 and also short of FULL — per `traceability-matrix.md:300`, all
three must reach FULL for 100%):**

- **ACM3-II-04** — "empty target list → empty map, zero graph-port calls" is
  cross-mapped to the pre-epic `audience-resolution.e2e-spec.ts:288` (`ACF-FC-03`),
  which asserts the identical claim but is **not** an approved ACM-3 Stage-2
  artifact in `approvals.yaml`. Fix: either formally adopt `ACF-FC-03` as
  II-04's Stage-2 record in `approvals.yaml`, or write a canonical ACM-3 test.
- **ACM3-II-05** — cross-mapped to `acm4r-multi-audience.e2e-spec.ts:296`
  (`ACM4R-MA-04`), which covers the duplicate-**target** half only. Missing: a
  **duplicated viewer-self id** in the same bulk call, and the assertion that
  the graph port received each id at most once. Fix: extend `ACM4R-MA-04` or add
  a sibling test.

### 3c. `canAccessSection` section string — CONFIRMED

The real `AccessControlFacade.canAccessSection(viewerId, section,
targetEmployeeId)` takes the **literal string `'S1'`** for the identity section.
Verified against `services/backend/test/access-control/acm5-section-access.e2e-spec.ts`
(`:144,151` use `'S1'`; `:161` `'S10'`; `:175` `'S11'`; `:198` `'S5'` as an
unsupported string → `'none'`) and the `ACM5-SA-*` scenario docs. Supported
strings: **`'S1'`, `'S10'`, `'S11'`**; every other string returns `'none'`.

**Phase A / Phase B used `'S1'` as a placeholder — that placeholder is correct.**
The adoption SPEC, the `umac-*` scenarios, and the future
`access-control-facade.adapter.ts` should use `'S1'` **verbatim**. **S9 is not a
supported section string** — the S9-write half of the career-timeline dual gate
(`um-ct-03..10`) has no `canAccessSection` call available and is a **pending
Access Control increment**; stage-2 for those scenarios is partially AC-blocked.

---

## 4. What must happen before the UM E2E suite is v1.5-green — ordered

1. **Epic 1 Story 1.1 (seeded import) lands** — a real import writer + a
   seed/import test-fixture helper (replacing `createUser()` → `POST /users` in
   every borrowed suite). `um-seed-01..03` go green (DB-state assertions).
2. **Retire `registration.e2e-spec.ts` and `deactivation.e2e-spec.ts`** — delete
   with their scenario folders; move `um-deact-02`'s surviving behaviour to a
   Story-1.5 `um-list-05` E2E.
3. **Epic 0 Story 0.1 (`UMAC-1`) — three AD-1 stages:** scenario approval →
   committed-red real-consumer HTTP E2E under `test/user-management/`
   (`umac-01..06`, seeding real `User` + `Relationship` rows, `Bearer
   <token:<uuid>>`) → production (new `access-control-facade.adapter.ts`, rebind
   `ACCESS_CONTROL_PORT`, **delete `interim-access-control.adapter.ts`**). The
   pre-existing `auth`/`events`/`relationships` 404s must be identical before and
   after.
4. **Rework `profile.e2e-spec.ts`** — real seeded UUIDs + real `Relationship`
   rows so the dual gate resolves; `um-pf-01..04` assert data correctness given
   an entitled actor. (Its E2E-rework decision is Story 0.1's scenario-stage
   call.)
5. **Open Decision (i) resolved** → (option a) an Access Control **kernel seed
   AD-1 sequence** adds `user-management:edit` (± photo) to the bootstrap catalog
   + grant, reaching `stage-3-production`; **then** Epic 0 Story 0.2 (`UMAC-2`)
   three stages → `umac-07/08/09` green. (Or option b: interim rule + expiry
   trigger.)
6. **`UpdateUserDto` gains explicit `@IsEmpty()` on `manager`/`peoplePartner`/
   `department`** + `umac-08` test (§3.2 fn 1 rejection, not silent strip).
7. **Epic 2 (Magic-Link Authentication)** — `POST /auth/magic-link[/consume]`
   controller + token model + real dispatcher; retire
   `interim-session-resolver.adapter.ts`. `auth/um-auth-01..06` go green.
8. **`UserEvents` schema + `/users/:id/events` controller (Epic 3)** —
   `career-timeline/um-ct-01..08` go green; `um-ct-01` reframed to seed/import.
9. **S9 `canAccessSection` Access Control increment** — unblocks the S9-write
   half of the career-timeline dual gate; `um-ct-03..10` fully translatable.
10. **`/users/:id/relationships` + `/users/:id/relationships/people-partner`
    controllers (Epic 4)** — `um-rel-01/02/03/07/08` go green **except** the
    atomic-journal assertions, which wait on **CC-07**. Mentorship specs
    (`um-rel-04..06`) are deleted, not fixed.
11. **CC-04 approved** → `um-rel-09..11` (PP) translatable. **CC-07 approved** →
    the journal assertions across `um-rel-01/02` and `um-rel-09..14`
    translatable. **Department edge contract approved** → `um-rel-12..14`
    translatable.
12. **CC-06 approved** → `departure/um-dep-01..04` translatable; `um-list-05`
    and `um-auth-06` stop seeding the dismissed/inactive state directly.
13. **Separate, parallel:** the **ACM3-II-06 Stage-2 follow-up** (Section 3b) —
    unblocks the Access Control Kernel MVP trace gate. Not on the UM critical
    path but named here because it is the one open P0 in the shared kernel.

---

## 5. Anything contradicting Phase A/B, or needing a human decision

- **No contradictions with Phase A/B found.** The adoption SPEC's `'S1'`
  placeholder is confirmed correct against code. The read leak, the missing
  `user-management:edit` permission, the `Bearer <token:Bob>` break, and the
  interim-adapter deletion are all as Phase A described.
- **New, small, for the code stage (not a Phase A/B contradiction):**
  `UpdateUserDto` strips `manager`/`peoplePartner`/`department` **silently**
  (they are not declared fields) rather than **rejecting** them. Phase A's Q3
  says the rejection "must be explicit and tested". Recorded as `umac-08` and in
  Section 2 — an `@IsEmpty()` addition, owned by Epic 0 Story 0.2 / Epic 1
  Story 1.2.
- **For the approver:** the open decisions the adoption SPEC / proposal §7
  raise — (i) missing edit permission, (v) photo Self-only, (vi) photo a
  distinct permission — still block or shape `umac-07`/`umac-09`. The code
  stages cannot start on the write path until (i) is decided. *(Decision (ii),
  two-state colleague rule, was **RESOLVED 2026-09-01**: colleague `GET
  /users/:id` → `200` S1 card from Story 0.1; `UMAC-3` removed; the read-path
  `umac-01..05` scenarios are updated accordingly and no longer record a
  temporary state.)*
- **`test-summary.md` is stale** and should get a superseded header (Section 1).
