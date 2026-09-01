---
title: 'UMAC-1 Stage 1 — port rebind + READ route adoption scenario prose'
type: 'chore'
created: '2026-09-01'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
stage_1_approved_by: 'Dmytro Novyk — 2026-09-01 (see approvals.yaml)'
baseline_revision: '9ac9d1b9e61385037e6254aef73be146753e6644'
context:
  - '{project-root}/_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md'
  - '{project-root}/_bmad-output/implementation-artifacts/access-control/um-integration-contract-response.md'
  - '{project-root}/docs/test-cases/README.md'
  - '{project-root}/docs/test-cases/user-management/README.md'
  - '{project-root}/docs/test-cases/user-management/access-control-adoption/README.md'
  - '{project-root}/docs/architecture/access-control.md'
  - '{project-root}/docs/architecture/testing-strategy.md'
  - '{project-root}/docs/architecture/nestjs-di-tokens.md'
warnings: [oversized]
deferred: []
---

<intent-contract>

## Intent

**Problem:** `user-management.module.ts` still binds `ACCESS_CONTROL_PORT` to
`InterimAccessControlAdapter`, whose `isAllowedForTarget` returns
`Boolean(userId)` — so every authenticated session reads every full `User`
profile — and whose `isAllowed` uses a `position === 'HR Admin'` role-name
check that `access-control.md` and AD-4 prohibit. `GET /users/:id` also
serializes the whole `User` row via `toUserResponse`.

**Approach:** Produce independently-reviewable AD-1 Stage-1 scenario prose
(no test code, no production code) for CAP-1 (real facade-backed
`ACCESS_CONTROL_PORT` adapter, interim adapter deleted), the READ half of
CAP-2 (`GET /users/:id` feature → audience mapping), and CAP-3 (the minimal
S1 identity-card projection on the `GET /users/:id` handler only). Deliver
line-by-line actor → request → expected-outcome scenarios covering Self /
reporting-line / assigned-PP / colleague reads (all `200`, the same S1 card),
the empty-audience denial (`401` unresolved session / `403` authenticated
active viewer), and the no-target `isAllowed` delegation
to the real facade. Reconcile the pre-existing `access-control-adoption/`
scenario docs to this SPEC and close their gaps. Then stop for independent
human approval — write nothing to `approvals.yaml`.

## Boundaries & Constraints

**Always:**
- Deliverables are prose only: the `docs/test-cases/user-management/access-control-adoption/`
  scenario files (`umac-01`..`umac-06` + that folder `README.md`) and this
  story spec. Every code change (test or production) is a later stage in
  `services/backend` and is out of scope here.
- Each scenario file follows `docs/test-cases/README.md` format: a
  plain-language **Scenario** (Given / When / Then) then an explicit request
  spec (`inputURL`, `inputRequest` headers + body, `expectedResult` with HTTP
  status), plus a **Trace** line citing sources.
- Cite: this SPEC (CAP-1 / CAP-2 read half / CAP-3); AD-2 and AD-21 in
  `architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md`; AD-3 in
  `architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md`;
  `access-control.md` denial conventions, §3.2 (S1 row is `R` for the
  Colleague column), §3.3.4 (colleague whitelist), matrix exceptions;
  `nestjs-di-tokens.md` (guards are the only sanctioned port consumer;
  actions never inject ports); `testing-strategy.md` (AD-1 stage separation);
  `um-integration-contract-response.md` Q1/Q2/Q4/Q5/Q6.
- The `GET /users/:id` body is the envelope `{ data, canEdit }` (human
  decision 2026-09-01 — fold the capability envelope in now). `data` is
  exactly: `id`, `firstName`, `lastName`, `photo`, `position`, `country`,
  `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`,
  `companyJoinDate` — and DROPS `ttId`, `isActive`, `customFields`,
  `createdAt`, `createdBy`. `canEdit` is the read-only dual-gate hint:
  `isAllowed(viewer, EDIT_USER_FEATURE) && canAccessSection(viewer, 'S1',
  target) === 'write'` — computed on the GET, enforcement stays on `PATCH`.
  `user-management:edit` is unseeded (Open Decision (i) = option (a),
  pending), so `canEdit` is `false` for every viewer today; it flips to
  `true` for `self`/`reporting`/`pp` once that kernel-seed sequence reaches
  `stage-3-production`, and is permanently `false` for a `colleague`
  (`canAccessSection` → `'read'`). The `{ data, canEdit }` shape is the
  section/detail-read convention going forward (photo, relationships, etc.
  each get their own envelope) — rolling it onto the other routes is its own
  planning item. Derived S1 display fields (manager, people partner,
  department, mentor, current projects) are out of scope for this route
  until those contexts land; `data` omits them and that is
  stated.
- `GET /users/:id`: any non-empty audience over an **active** target
  (`self`, `reporting`, `pp`, or `colleague`) → `200` with the same
  `{ data, canEdit }` envelope (identical `data`; `canEdit` per the dual gate).
  Denials: an unresolved session → `401` (session layer; the interim
  resolver is lax, so such a request reaches the guard and surfaces as
  `403`); an authenticated active viewer with an empty audience (target not
  an active `User`) → `403`. No "leak-free `404`" (human product decision
  2026-09-01) and no guard/controller change.
- CAP-3 scope statement in the doc: Story 0.1 adds a dedicated S1-card DTO on
  the `GET /users/:id` handler ONLY. `GET /users` (list), `POST /users`,
  `PATCH /users/:id`, `DELETE /users/:id`, `PUT /users/:id/photo` response
  bodies are unchanged by this slice. The FURTHER narrowing (S10 dates-only,
  S11 name-only, S16 per-field) stays FR-17 Profile Projection.
- `interim-access-control.adapter.ts` is deleted in the same cutover, not
  left beside the real one (AD-21).
- No-target `isAllowed` for `user-management:create` / `:deactivate` /
  `:list` delegates straight to `AccessControlFacade.isAllowed`: still allows
  the seeded HR-Admin root, denies everyone else — including an impostor
  whose `User.position` is `'HR Admin'` but who holds no FR grant chain.
- Real-audience scenarios use `Bearer <token:<seeded-uuid>>`, never a persona
  literal. `Bearer <token:Bob>` resolves to the non-existent string id
  `'Bob'` → empty audience → `403` via the guard (`401` once the real
  session middleware lands).
- The denial mechanism is settled (2026-09-01): `AccessControlGuard` already
  maps a denied `isAllowedForTarget` to `403`, which is the intended outcome
  — no guard or controller `NotFound` branch.
  Flag it; do not silently pick one.

**Block If:**
- Reconciling the pre-existing `access-control-adoption/` scenario docs or
  E2E suite to this SPEC would require editing any file under
  `services/backend/` (test or production code), `prisma/`, a migration,
  `seed.ts`, or any `src/access-control/**` file. Surface it; do not make the
  edit.
- The intent for a scenario has more than one defensible reading that leads
  to observably different expected outcomes and neither this SPEC,
  `um-integration-contract-response.md`, nor `access-control.md` selects
  between them.

**Never:**
- No test code, no production code, no commit of code, no `approvals.yaml`
  write, no approval assertion.
- No scenario that touches Access Control files, the Prisma schema,
  migrations, or the seed.
- No write-path scenarios (`PATCH /users/:id`, `PUT /users/:id/photo`) —
  those are UMAC-2 (`umac-07`..`umac-09`), which this story does not author
  or modify.
- No new route; no `AccessControlPort` signature change; no `AccessControlGuard`
  change (the `403` the guard already produces is the intended denial).
- No rewrite of the shared `toUserResponse`; no change to the other five
  response bodies.
- Do not fake or stub this story's own deliverable.

</intent-contract>

## Code Map

Read-only anchors — no file here is edited by this story; they are what the
scenarios describe and what Stage 2/3 will change.

- `services/backend/src/user-management/user-management.module.ts:36` -- the
  adoption seam: `{ provide: ACCESS_CONTROL_PORT, useClass: InterimAccessControlAdapter }`.
  One binding answers all three `/users/:id` routes.
- `services/backend/src/user-management/infrastructure/interim-access-control.adapter.ts`
  -- `isAllowedForTarget` returns `Boolean(userId)` (the read leak);
  `isAllowed` does the prohibited `position === 'HR Admin'` check. Deleted at
  Stage 3 (AD-21).
- `services/backend/src/user-management/application/controllers/users.controller.ts:39-83`
  -- feature constants; `findOne` (`GET /users/:id`, `@RequireFeatureForTarget(READ_USER_FEATURE)`)
  serializes through `toUserResponse`.
- `services/backend/src/user-management/application/dtos/user.response.ts:10`
  -- `toUserResponse` spreads the whole `User` row; CAP-3 adds a separate
  S1-card mapper for `findOne` only.
- `services/backend/src/user-management/application/guards/access-control.guard.ts:44-55`
  -- maps a denied `isAllowedForTarget` to `ForbiddenException` (`403`) — this
  is `umac-05`'s intended denial; no change here.
- `services/backend/src/access-control/application/access-control.facade.ts`
  -- `isAllowed(userId, key)`, `resolveAudiences(viewerId, ids)` (empty `Set`
  for an unconfirmed viewer/target), `canAccessSection(viewerId, 'S1', target)`.
- `services/backend/src/access-control/domain/services/audience-resolver.service.ts`
  -- identity confirmed before derivation; `self` exclusive; `colleague` is
  the floor when no edge qualifies.
- `services/backend/src/user-management/infrastructure/interim-session-resolver.adapter.ts:48`
  -- accepts `Bearer <token:<uuid>>` as `{ userId: persona }` unchanged;
  kept (UM Epic 2 retires it).
- `docs/test-cases/user-management/access-control-adoption/` -- pre-existing
  `umac-01`..`umac-09` + `README.md` (committed `2026-09-01`, unapproved
  draft). `umac-01`..`umac-06` are this story's; `umac-07`..`umac-09` are
  UMAC-2's and are not touched.
- `services/backend/test/user-management/access-control-adoption/` -- a
  pre-existing committed E2E suite (`read-adoption`, `read-denial`,
  `no-target-permission`, `write-adoption`, `fixtures.ts`) that already
  translates these scenario ids. Out of scope to edit; see Design Notes.
- `services/backend/test/user-management/profile.e2e-spec.ts` -- `um-pf-01`..`04`
  use `Bearer <token:Bob>` literals; break under the real facade. Whether
  they move to real personas or a tightened scope note is a Stage-2 call
  (`um-integration-contract-response.md` Q6) — recorded, not resolved here.

## Tasks & Acceptance

**Execution (prose only):**
- `docs/test-cases/user-management/access-control-adoption/umac-01-self-read-s1-card.md`
  -- verify: Self (`Bearer <token:<V-uuid>>`, `GET /users/<V>`) → `200`, body
  contains the 12 S1 fields, does not contain `ttId`/`isActive`/`customFields`/`createdAt`/`createdBy`;
  CAP-3 scope paragraph present. Correct only on a real deviation from this SPEC.
- `.../umac-02-reporting-line-viewer-read.md` -- verify: real `Relationship`
  `T → V` `type='direct'` (Test 1 direct, Test 2 transitive `T → M → V`),
  `GET /users/<T>` as V → `200`, same S1 card. In-suite edge, never a
  hardcoded id.
- `.../umac-03-assigned-pp-read.md` -- verify: real `Relationship` `T → V`
  `type='people_partner'`, `GET /users/<T>` as V → `200`, same S1 card; note
  that reading the `people_partner` edge is not blocked by CC-07.
- `.../umac-04-colleague-read-s1-card.md` -- verify: no edge, V ≠ T, both
  active → `200` with the SAME S1 card (§3.2 S1 row = `R` for Colleague;
  every active authenticated viewer is at least a Colleague). Positive test,
  no `403`, no two-state rule.
- `.../umac-05-unresolved-session-read-denied.md` -- verify Test 1 (`Bearer <token:Bob>`),
  Test 2 (deactivated caller) each → `403` via the guard under the interim
  resolver (`401` once the real session middleware lands); Test 3 (valid
  active caller, inactive/non-existent target) → `403`, no existence
  distinction. No "leak-free `404`" branch.
- `.../umac-06-no-target-isallowed-delegates-to-facade.md` -- verify Test 1
  (seeded HR-Admin root → allowed on `GET /users` / `POST /users` /
  `DELETE /users/:id`), Test 2 (unrelated active session → `403`), Test 3
  (Ida, unrelated FR permission → `403`). **Add the impostor case**: a
  session whose `User.position` is `'HR Admin'` but with no FR grant chain →
  `403` on all three (the facade never compares a role name or
  `User.position`) — this is the assertion that makes the delegation
  committed-red.
- `docs/test-cases/user-management/access-control-adoption/README.md` -- verify
  the seam table, the S1-card field list, the fixture convention, the
  "colleague reads the S1 card" section, and the per-file state table are
  accurate to this SPEC and to the `umac-06` impostor addition.
- This story spec (`## Design Notes` below) -- carry the consolidated
  line-by-line actor → request → expected-outcome table so the reviewer sees
  the whole Stage-1 surface in one place.

**Acceptance Criteria:**
- Given the approved SPEC and dispatch citations, when the scenario package
  is reviewed, then `umac-01`..`umac-06` each open with a Given/When/Then
  Scenario, carry an explicit request spec and a Trace line, and every
  required source above is cited somewhere in the set.
- Given `umac-01`/`umac-02`/`umac-03`/`umac-04`, when their `expectedResult`
  bodies are compared, then all four assert the identical `{ data, canEdit }`
  shape — `data` the identical 12 S1 fields with the five technical fields
  absent, and `canEdit` `false` (all four; `umac-04` `false` by section
  access, the rest by the unseeded edit permission).
- Given `umac-04`, when read, then the colleague outcome is `200` with the S1
  card (not `403`), justified by §3.2 S1 = `R` for the Colleague column.
- Given `umac-05`, when read, then an unresolved session is `401` (the
  session layer; `403` via the guard under the interim resolver) and an
  authenticated active viewer with an empty audience is `403` with no
  existence distinction; there is no `404` branch.
- Given `umac-06`, when read, then it includes the impostor case
  (`User.position = 'HR Admin'`, no FR grant → `403`) and states that
  `isAllowed` delegates straight to `AccessControlFacade.isAllowed` and that
  `interim-access-control.adapter.ts` is deleted in the same cutover (AD-21).
- Given the whole package, when checked for scope, then no write-path
  (`PATCH` / `PUT photo`) scenario was added or changed by this story, and no
  scenario references an Access Control file, the Prisma schema, a migration,
  or the seed as something this slice changes.
- Given `testing-strategy.md` AD-1, when this dispatch finishes, then it has
  written no test or production code and no `approvals.yaml` entry, and it
  stops for independent human approval.

## Spec Change Log

## Review Triage Log

## Design Notes

### Consolidated Stage-1 surface (actor → request → expected outcome)

| # | Actor / session | Request | Expected outcome |
|---|---|---|---|
| umac-01 | V = active seeded `User`, session for own id (`Bearer <token:<V>>`) | `GET /users/<V>` | `200`; `{ data, canEdit }`. `data` = S1 card (`id`, `firstName`, `lastName`, `photo`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`); `ttId`/`isActive`/`customFields`/`createdAt`/`createdBy` absent. `canEdit`: `false` (edit permission unseeded) |
| umac-02.1 | V, with real `Relationship` `T → V` `type='direct'` | `GET /users/<T>` as V | `200`; same `{ data, canEdit }`; `canEdit` `false` |
| umac-02.2 | V, with real chain `T → M → V` `type='direct'` | `GET /users/<T>` as V | `200`; same `{ data, canEdit }` (transitive `reporting`); `canEdit` `false` |
| umac-03 | V, with real `Relationship` `T → V` `type='people_partner'` | `GET /users/<T>` as V | `200`; same `{ data, canEdit }` (`pp`); `canEdit` `false` |
| umac-04 | V active, no edge to T, V ≠ T (colleague floor) | `GET /users/<T>` as V | `200`; the SAME `data`; `canEdit` `false` **by section access** (`canAccessSection` → `'read'`) |
| umac-05.1 | `Bearer <token:Bob>` (→ non-existent id `'Bob'`) | `GET /users/<T>` | `403` via the guard (interim resolver); `401` once the real session middleware lands |
| umac-05.2 | caller's own `User` row `isActive: false` | `GET /users/<T>` as deactivated caller | `403` via the guard; `401` end state |
| umac-05.3 | valid active caller, inactive or non-existent target id | `GET /users/<target>` | `403` (empty audience; no existence distinction) |
| umac-06.1 | seeded HR-Admin root (holds `hr-admin` FR grant) | `GET /users`, `POST /users`, `DELETE /users/:id` | allowed (`200` / `201` / `200`) |
| umac-06.2 | unrelated active `User`, no FR attachment | same three | `403` |
| umac-06.3 | Ida — holds an unrelated FR permission | same three | `403` (DEC-UM-002) |
| umac-06.4 | impostor — `User.position = 'HR Admin'`, no FR grant chain | same three | `403` (facade never reads `position`) |

Missing/invalid token → `401` is the global rule and is not a per-scenario
row.

### Why the scenario prose is not merely the existing docs

`umac-01`..`umac-09` and a matching `test/user-management/access-control-adoption/`
E2E suite were committed together on 2026-09-01 ("verify all docs, create
tests") — scenario prose and Stage-2 tests in one commit, ahead of any
recorded Stage-1 approval. `testing-strategy.md` (the worked cautionary tale
at line 27) names that exact ordering as an AD-1 gate violation. This story
does not bless the tests; it produces the reviewable Stage-1 scenario
artifact, closes the `umac-06` impostor gap and the `umac-05` Test-3 gap, and
leaves whether the pre-committed suite is accepted, re-derived, or reverted
to the human at approval time and to the UMAC-1-red-tests dispatch.

### canAccessSection / audience facts

`AccessControlFacade.canAccessSection` takes the literal `'S1'`; supported
strings are `'S1'`/`'S10'`/`'S11'`, everything else returns `'none'`. For the
READ decision the adapter only needs "audience set non-empty" from
`resolveAudiences(viewer, [target])`; `canAccessSection(viewer, 'S1', target)
=== 'none'` expresses the same empty-set denial. The write `read`/`write`
split is UMAC-2's concern, not this route's body.

## Auto Run Result

Status: done. Stage-1 scenario prose for Epic 0 Story 0.1 authored / reconciled:
`docs/test-cases/user-management/access-control-adoption/umac-01..06.md` + folder
`README.md`. Independently approved by Dmytro Novyk (Product Owner / Architect)
on 2026-09-01 — recorded in
`_bmad-output/specs/spec-user-management-access-control-adoption/approvals.yaml`
(`UMAC-1-scenarios`, `stage-1-scenarios`, author = Claude Code agent, approver =
Dmytro Novyk, commit `5fe0bb86759c350de1d88da710f4f10a09f0431e`).

Human decisions folded in at approval (Dmytro Novyk, 2026-09-01):
1. `GET /users/:id` denials are `401` (unresolved session — session layer) and
   `403` (authenticated active viewer, empty audience); the earlier "leak-free
   `404`" is withdrawn. No guard/controller change — the `403` is what
   `AccessControlGuard` already produces.
2. Fold the `{ data, canEdit }` capability envelope into `GET /users/:id` now
   (option (a), not deferred). `data` = the 12 S1 fields; `canEdit` = the
   read-only dual-gate hint `isAllowed(viewer, EDIT_USER_FEATURE) &&
   canAccessSection(viewer, 'S1', target) === 'write'`. `canEdit` is `false`
   for every viewer until `user-management:edit` is seeded (colleague:
   permanently `false` by section access). Scenarios re-approved the same day
   (superseding entry in `approvals.yaml`).

Next dispatch: `UMAC-1-red-tests` (Stage 2). Note for that dispatch: a
prematurely-committed E2E suite already exists under
`services/backend/test/user-management/access-control-adoption/`
(`read-adoption`, `read-denial`, `no-target-permission`, `write-adoption`,
`fixtures.ts`), committed in `986e90a`/`0681939` alongside the scenario prose
before any Stage-1 approval — an AD-1 ordering violation. `read-denial` asserts
`404` and must be realigned to `403`. `write-adoption` is UMAC-2 scope and does
not belong to UMAC-1. The Stage-2 dispatch decides: accept, re-derive, or revert.

## Verification

No build/test/lint applies — the deliverable is prose.

**Manual checks:**
- `docs/test-cases/user-management/access-control-adoption/umac-01..06.md` and
  `README.md` exist, parse as Markdown, and follow the
  `docs/test-cases/README.md` skeleton (Scenario Given/When/Then + request
  spec + Trace).
- Every Acceptance Criterion above is satisfied by reading the six files.
- `git status` shows changes only under
  `docs/test-cases/user-management/access-control-adoption/` and this story
  spec — nothing under `services/backend/`, `prisma/`, or
  `src/access-control/**`; `umac-07`..`umac-09` unchanged.
- No file was added to `_bmad-output/specs/spec-user-management-access-control-adoption/approvals.yaml`
  (it still does not exist).
