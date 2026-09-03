# User Management — Test-Case Suite

Stage-1 quality-gate scenario documents (AD-1), following the team-wide authoring
pattern in [../README.md](../README.md): **one test case per file**, each opening
with a plain-language **Scenario** (Given/When/Then) followed by the explicit
request spec — `inputURL`, `inputRequest` (headers + body), `expectedResult` with
HTTP status — traced to `docs/project-requirements.md` (§), the
[user-management PRD](../../../_bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/prd.md)
(FR-n), architecture decisions (AD-n), and/or
[user-management-test-decisions.md](../../architecture/user-management-test-decisions.md)
(DEC-UM-n).

## Status — v1.5 refresh is UNAPPROVED DRAFT

**This suite was refreshed for spec v1.5 on 2026-09-01** (sprint-change-proposal
`sprint-change-proposal-2026-09-01-user-management-access-control-alignment.md`,
Phase A architect + Phase B PM + this TEA phase). The pre-2026-08-25 "Approved
baseline" no longer holds for the changed files:

- `seed/`, `access-control-adoption/`, `departure/` are **new** folders — **no
  file is approved**; per-file human approval under the AD-1 stage-1 gate is
  required before any stage-2 E2E.
- `registration/` and `deactivation/` are **RETIRED** — folder `README.md`
  pointers; the individual files are retained as history only (do not translate,
  cite, or approve).
- `relationships/` was **split** to v1.5 Epic 4 — some files retraced (fresh
  approval required), three mentorship files retired (superseded header).
  **Story 4.1 reconciled 2026-09-03** to the 2026-09-02 architecture ratification
  (PM/AD-29 `AccessJournal` ratified — "closes CC-07 design"): the
  same-transaction journal write is now a **first-class assertion** in
  `um-rel-01/02/03/08`, not "stage-2 blocked on CC-07". New `um-rel-15`
  (`AccessJournal` append-only + idempotent write + reader-authorized
  `GET /users/:id/access-journal`). **Story 4.2 reconciled 2026-09-03** to the
  same ratification: CC-07/PM/AD-29 done via Story 4.1, CC-04 design-resolved
  (`P2`, "Not a design blocker on PM/AD-19"). `um-rel-09/10/11` lose the
  BLOCKED box — `PUT/DELETE /users/:id/relationships/people-partner`, atomic
  create-or-replace, self-assignment `400`, stale/omitted `expectedCurrentTargetId`
  `409`, `people_partner` journal row first-class. New `um-rel-16` (`DELETE` +
  PP-change authz `403` + new-PP audience on next request). **Deferred:**
  HR-line propagation above the directly assigned PP (fail-closed).
  **Story 4.3 reconciled 2026-09-03 to a split-gate:** the department membership
  write (add / atomic named-source move / remove; ≥1-department floor → `DELETE`
  of the last → `409`), the department-manager write (AR `Policies`
  `targetType:'department'` `targetRole:'unit-manager'` + `UserPolicies`),
  self-assignment `400`, and every same-transaction `department_change` event /
  `AccessJournal` row (`department_membership` / `department_manager`) are
  **first-class stage-2** (`um-rel-12` T1–T2, `um-rel-13` T1–T2, `um-rel-14`;
  new `um-rel-17` department membership add/remove/last-→`409`). CC-07/PM/AD-29
  done via 4.1; the `department_change` mechanism done via Epic 3 Story 3.1;
  `Department.parentId` + `DepartmentMembership` schema present (Story 1.1).
  Story 4.1 and 4.2's direct-edge scenarios and 4.3's write half leave "Blocked
  = prose only"; **4.3's department-derived-access slice** (`um-rel-12` T3,
  all of `um-rel-13`'s access half, `um-rel-17` `it.todo` — an
  Access-Control-kernel increment) and 4.2's HR-line slice stay.
- `career-timeline/` traces were **realigned** to DEC-UM-001 / Stories 3.2–3.3
  (fresh approval required); two dual-gate negatives added. **Story 3.2
  reconciled 2026-09-02** to the split-gate decision (Dmytro): manual backfill
  ships gated on `profile:timeline:write` **alone** (feature action, `hr-admin`
  only); the DEC-UM-001 PP/direct-UM audience scoping is deferred to the
  FR-permission-matrix grant. New `um-ct-12` (HR-Admin add, live); `um-ct-03/04/09`
  reframed as deferred `it.todo`; `um-ct-10` stays live. A folder
  `career-timeline/README.md` now carries the decision + the ⚠️-to-ratify tension.
  **Story 3.3 reconciled 2026-09-03** to the same shape: `DELETE .../events/:eventId`
  is soft-delete-only, gated on `profile:timeline:write` alone (`hr-admin` only);
  a correction is `DELETE` + `POST`, no `PATCH`, no "correct" endpoint. New
  `um-ct-13` (HR-Admin soft-delete + correction flow, live); `um-ct-07/08`
  retargeted to Root and stay live (actor-agnostic); `um-ct-05/06` reframed as
  deferred `it.todo`. Scenario-stage decisions: `DELETE` → `204 No Content`;
  unknown / already-soft-deleted / cross-timeline `eventId` → `404`.
- `profile/` gained the `um-photo-*` set (Story 1.3, 9 new files + folder
  `README.md`); `um-pf-02` retired to a superseded pointer; `um-pf-01/03/04` and
  `auth/` got **header notes** (fresh approval required).
- `list/` was **rewritten from a blank page** for spec v1.5 (2026-09-02) —
  12 files (`um-list-01..12`); the four pre-v1.5 drafts are replaced. See the
  folder README.
- `auth/` — **Story 2.1 scenarios reconciled 2026-09-02** (`um-auth-01`,
  `um-auth-02`, new `um-auth-02b`; `um-auth-06` split to consume-half only) and a
  folder `README.md` added. Story 2.2 files (`um-auth-03..06`) not otherwise
  touched. Fresh approval required.

**No `_bmad-output/specs/*/approvals.yaml` records any of this refresh.** An
agent's review of its own output is never a substitute for human approval
([testing-strategy.md](../../architecture/testing-strategy.md)).

The Access Control test-case suite **now exists on disk**
([../access-control/](../access-control/), 171 draft files, and
[../access-control-kernel/](../access-control-kernel/)) — the older "not yet
authored" caveats are removed. Entitlement for `/users/:id` specifically is
**Epic 0's** — see [`access-control-adoption/`](access-control-adoption/).

Spec contract: `_bmad-output/specs/spec-user-management-test-cases/SPEC.md`.

## Scope — read this before adding a file

This suite tests **workflow and data correctness**, plus — new in v1.5 — the
**adoption** of the real Access Control facade for the `/users/:id` routes
(`access-control-adoption/`, Epic 0). The base access-control model (audience
derivation, §3.2 matrix cells, fail-closed) is proved in
[../access-control/](../access-control/) and
[../access-control-kernel/](../access-control-kernel/); the `profile/`,
`career-timeline/`, and `relationships/` files here assume an already-entitled
actor and assert what the feature does.

The `User` entity carries only S1-identity-card fields
([database-schema.md](../../architecture/database-schema.md)) plus `UserEvents`.
No S2/S3/S4/S5 field appears in any request or response body here.

## Conventions (apply to every file)

- **Authorization header.** `"Bearer <token:persona>"` = a valid session for that
  persona; `""` = unauthenticated. Every endpoint rejects a missing/invalid token
  with `401` (global rule, [../README.md](../README.md)).
- **Real-audience cases use a seeded UUID, not a persona literal.** Where a
  scenario's outcome depends on a real Phase-0 audience (all of
  `access-control-adoption/`, and the entitlement half of `career-timeline/`),
  the header is `"Bearer <token:<seeded-uuid>>"` and stage 2 seeds real `User` +
  `Relationship` rows. `Bearer <token:Bob>` resolves to the non-existent string
  id `'Bob'` → empty audience → `403` under the real facade
  (`um-integration-contract-response.md` Q6).
- **Denial convention.** Valid token, no feature permission → `403`. Write to
  readable-only data → `403`. Touching a `—` cell or hidden field → `404`
  leak-free. Absence is absence (key missing, never `null`).
- **Permission-negative probes (DEC-UM-002).** Use **Ida** for generic
  feature-capability denials; **Colin**/**Eve** for an unrelated active session;
  Bob only for a manager-specific probe unrelated to the capability under test.
  Never a role-name or `User.position` check — the facade's no-target `isAllowed`
  is the gate.
- **Endpoints** bind to the canonical router-tree convention
  ([api-conventions.md](../../architecture/api-conventions.md), AD-14): resource
  root `/users` (read/update only — **no `POST /users`**, no generic delete),
  auth root `/auth`, owned collections `/users/:id/events`, attachment endpoints
  `/users/:id/relationships`, `/users/:id/relationships/people-partner`,
  `/users/:id/departures`. Section addressing uses human-readable names, never
  `sNN` ids in a URL.
- **`UserEvents` immutable-fact model.** A correction is soft-delete-then-append,
  never an in-place PATCH.
- **Isolation (DEC-UM-010).** One test worker + UUID-owned data initially;
  schema-per-worker before parallel CI. `@concurrency` scenarios use parallel
  HTTP inside one test.

## Canonical personas

From the **seeded population import** (Story 1.1 / `seed/`). There is no
`POST /users`. Reconcile against
[access-control/README.md](../access-control/README.md)'s fixture where the
graphs overlap.

| Persona | Role in this suite |
| --- | --- |
| **Root** | Seeded bootstrap `User` holding the `hr-admin` FR policy (`user-management:create` / `:deactivate` / `:list`). ACM-0 creates the row; ACM-1 attaches the policy. Also holds *change organisational relationships* and *record a departure* where those scenarios need an entitled actor, and — for Epic 3 Story 3.2 — a seeded `profile:timeline:write` permission on the `hr-admin` role (manual career-timeline backfill; `career-timeline/README.md`). |
| **Alice** | Seeded employee. Reports to Bob; assigned PP Paula. Subject of profile-edit, auth, career-timeline, relationship, and departure scenarios. |
| **Bob** | Alice's **direct** Unit Manager (Reporting line). Edits Alice's S1 fields (entitlement asserted by Epic 0); manual career-timeline add/correct/delete under DEC-UM-001. |
| **Paula** | Alice's assigned People Partner. Manual career-timeline add/correct/delete under DEC-UM-001. |
| **Nina** | Seeded employee used where a scenario needs a fresh target or a new PP/manager. |
| **Colin** | Unrelated seeded employee, no FR policy. Holds the in-use `workEmail`/`ttId` the uniqueness cases collide against. Used for unrelated-session denial. |
| **Ida** | Holds a custom functional role whose only permission is unrelated (*create form campaigns*). Generic feature-permission `403` probes (DEC-UM-002). |
| **Eve** | Authenticated seeded employee with no edges to Alice — colleague-floor / unrelated-session probes. |

Retired personas: the registration-only "Tomas" / "create target" personas are
gone with `registration/`.

## Layout

| Folder | Covers | Files | State |
| --- | --- | --- | --- |
| `seed/` | FR-1/FR-4/FR-5a/FR-7 — population import (`POST /users/import` + deploy-script entrypoint): column mapping, Department create-on-import, `EmploymentStatus`, birthday split, idempotent re-import, malformed-row skip, authz, no `POST /users`, bootstrap HR Admin + ACM-0 root-id reuse (Story 1.1) | 13 | new draft |
| `access-control-adoption/` | FR-16 — real facade adoption for `GET/PATCH /users/:id`, `PUT .../photo`; port rebind; minimal S1-card projection; colleague reads the S1 card (`200`) (Epic 0, `UMAC-1/2`) | 9 | new draft |
| `auth/` | FR-2/FR-3/FR-8 — magic-link request/consume, security edge cases (Epic 2) | 6 | header-noted draft |
| `profile/` | FR-9 — S1 data correctness given an entitled actor (entitlement is Epic 0's): `um-pf-*` = Story 1.2 scalar `PATCH`; `um-photo-*` = Story 1.3 `PUT .../photo` + real object storage (AD-15). Folder `README.md` carries the photo cluster's in-scenario decisions. | 12 (+ `um-pf-02` retired pointer) | new/refreshed draft |
| `list/` | FR-15 — `GET /users` pagination + metadata, permission-safe S1-field filters, dismissed-employee visibility via `employmentStatus`, endpoint authz, fixed fail-closed projection, unknown-filter rejection, empty page, deterministic sort, NFR-2 perf note (Epic 1 Story 1.5) | 12 | blank-page v1.5 rewrite (`um-list-01..04` retargeted, `um-list-05..12` reworked/new); folder README carries the in-scenario decisions |
| `career-timeline/` | FR-5/FR-11/FR-12/FR-13 — system events; career-timeline read audience; Story 3.2 manual backfill + Story 3.3 soft-delete / correction (feature-permission gate, `hr-admin` only this stage; DEC-UM-001 PP/direct-UM audience scoping deferred to the FR-matrix grant); edit-immutability, no `PATCH` (Epic 3). Folder README carries the split-gate decision + the ⚠️-to-ratify tension. | 13 (+ folder `README.md`) | Story 3.2 reconciled 2026-09-02; **Story 3.3 reconciled 2026-09-03** (`um-ct-13` new; `um-ct-03/04/05/06/09` → `it.todo` deferred; `um-ct-07/08/10/12/13` live) |
| `relationships/` | FR-10 — Epic 4 organisational facts: manager + the `AccessJournal` foundation (4.1, retraced/authored, journal assertions first-class per PM/AD-29), PP (4.2, reconciled 2026-09-03 — direct assigned-PP edge first-class; HR-line propagation deferred), department + department-manager (4.3, split-gate reconciled 2026-09-03 — membership/manager **writes** + `department_change` event + `department_membership`/`department_manager` journal rows first-class; department-derived **access resolution** deferred `it.todo` pending an AC-kernel increment) | 14 | split; see folder README |
| `departure/` | FR-6 — Epic 5 employment lifecycle (record / blocked / apply / retry) | 4 | new draft, **all BLOCKED — CC-06** |
| `registration/` | **RETIRED (v1.5)** — `um-reg-01..15` `POST /users` HTTP create. See folder README. | 15 | history only |
| `deactivation/` | **RETIRED (v1.5)** — `um-deact-01..03` generic `DELETE /users/:id`. See folder README. | 3 | history only |

**Live stage-1 scenario files (v1.5, subject to per-file approval):** 76
(+8: the `um-photo-*` set replacing the single `um-pf-02`; +1: `um-ct-11`;
+1: `um-ct-12`; +1: `um-ct-13`; +1: `um-rel-15`; +1: `um-rel-16`; +1: `um-rel-17`).
`um-ct-03`, `um-ct-04`, `um-ct-05`, `um-ct-06`,
`um-ct-09` stay on disk as **deferred `it.todo`** — target end-state prose
retained, approved as such; they reactivate on the FR-permission-matrix grant of
`profile:timeline:write` to the PP / Unit-Manager roles (`um-ct-06` also needs
the AC department-tree walk) (`career-timeline/README.md`).
**Retained as history (retired, do not approve):** 22 (`registration/` 15,
`deactivation/` 3, `relationships/um-rel-04..06` 3, `profile/um-pf-02` 1).

## What blocks stage-2

| Blocker | Blocks |
| --- | --- |
| Epic 0 Story 0.1 not yet landed (port rebind + S1-card DTO) | `access-control-adoption/umac-01..06` E2E is committed-red until the rebind + S1-card DTO land |
| Missing `user-management:edit` permission (Open Decision i) | `access-control-adoption/umac-07` (CONDITIONAL) |
| Profile Projection story (FR-17) reaching production | the S10 dates-only / S11 name-only / S16 per-field colleague views **on their own surfaces** (`GET /users/:id/leaves`, etc.) — **not** `GET /users/:id`, which returns the S1 card from Story 0.1 (`umac-04`, positive test) |
| FR-permission-matrix grant of `profile:timeline:write` to the PP / Unit-Manager roles (`fr-permission-matrix-draft-2026-09-02.md` §6 item 4, `?`) + the DEC-UM-001 audience narrowing being wired (`canAccessSection('profile:timeline', …) === 'write'`, scoped to assigned PP / direct UM) | `um-ct-03`, `um-ct-04`, `um-ct-05`, `um-ct-06`, `um-ct-09` — held as deferred `it.todo` target prose. **Not** blocked: `um-ct-10` / `um-ct-12` (Story 3.2) and `um-ct-07` / `um-ct-08` / `um-ct-13` (Story 3.3) — the live paths' gate at this stage is `isAllowed(actor, 'profile:timeline:write')` alone, a no-target facade call; `career-timeline/README.md`. |
| `profile:timeline` `canAccessSection` — a **pending Access Control increment** (ACM-5 ships the three legacy section strings only) | the reactivation of `um-ct-03/04/09` (Story 3.2) and `um-ct-05/06` (Story 3.3). **Story 3.2's** live paths (`um-ct-10/12`) and **Story 3.3's** live paths (`um-ct-07/08/13`) do **not** need it. The **read** gate (`um-ct-11`, Story 3.1 `GET /users/:id/events`) is **not** blocked — it uses the sanctioned `resolveAudiences`-derived interim (mentorship timeline-section precedent, `// INTERIM` + expiry trigger); `deferred-work.md` tracks the real increment. |
| DEC-UM-001 direct-Unit-Manager leg needs the AC **department-tree walk** increment (`targetType:'department'` + recursion) | the direct-UM manual-write path in `um-ct-04` and the direct-UM soft-delete path in `um-ct-06` (both deferred `it.todo`; the assigned-PP leg in `um-ct-03`/`um-ct-05` is unaffected) |
| Department contract / PM/AD-35 (nested `Department` parent/manager edge schema + recursive department-tree walk; spine Deferred) — the HR-boundary binding | **Story 4.2's HR-line-propagation slice only** (the HR chain *above* the directly assigned PP; fail-closed to the direct PP until then). The **direct assigned-PP edge** (`relationships/um-rel-09/10/11/16`) is **not** blocked — CC-07/PM/AD-29 done via Story 4.1, CC-04 design-resolved (`P2`, "Not a design blocker on PM/AD-19"). |
| **AC `resolveAudiences` department-tree walk** — the `targetType:'department'` `Policies` leg + `Department.parentId` recursion; an **Access-Control-kernel increment** (`spec-access-control-kernel-mvp`, approver Anna Pikula), not User-Management work. Unblock trigger: *"reaches stage-3-production (`spec-access-control-kernel-mvp`)."* | `relationships/um-rel-12` T3, **all of `um-rel-13`'s access half** (T3 — the recursive walk over nested departments), `um-rel-17`'s deferred `it.todo` — the department-derived **access resolution** only. **Not** blocked: the department **membership** write + atomic move + ≥1-floor `409`, the department-**manager** `Policies`/`UserPolicies` write, self-assignment `400`, and every same-transaction `department_change` event / `AccessJournal` row — `um-rel-12` T1–T2, `um-rel-13` T1–T2, `um-rel-14`, `um-rel-17` T1–T4. `Department.parentId` + `DepartmentMembership` schema present (Story 1.1); CC-07/PM/AD-29 done via Story 4.1; the `department_change` mechanism done via Epic 3 Story 3.1. |
| CC-06 (scheduled-departure state + executor) | all of `departure/` |

## Normative decisions

[user-management-test-decisions.md](../../architecture/user-management-test-decisions.md)
(DEC-UM-001..012). DEC-UM-006 and DEC-UM-008 are **RETIRED** (no `POST /users`).
DEC-UM-007 and DEC-UM-009 are reconciled to the seed/import writer + ACM-0.
