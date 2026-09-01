---
title: Sprint Change Proposal — User Management ↔ Access Control Alignment
date: 2026-09-01
status: approved
mode: batch
scope: user-management-planning-artifacts-and-companion-docs-only
normativeSoT: docs/project-requirements.md
builds_on:
  - sprint-change-proposal-2026-08-29.md
  - sprint-change-proposal-2026-08-30-access-control-kernel-mvp.md
  - sprint-change-proposal-2026-08-30-kernel-mvp-p2-repair.md
architect_handoff: _bmad-output/implementation-artifacts/access-control/architect-handoff-phase-b.md
approved_by: 'Dmytro Novyk (Product Owner / Architect) — 2026-09-01'
---

> **Status boundary.** `status: approved` — the planning-artifact and
> `docs/architecture/` companion-doc changes in §4 are approved (Dmytro Novyk,
> Product Owner / Architect, 2026-09-01), and the §7 Open Decisions are taken
> per §8. This approval touches **no** `_bmad-output/specs/*/approvals.yaml`:
> regenerated story specs stay `status: draft` and each still runs its three
> AD-1 stages with independent human approval. This proposal changed planning
> artifacts and `docs/architecture/` companion docs only — **no application
> code, Prisma schema, migration, seed, or test file**, and nothing under
> `services/backend/`. The v1.5 alignment of the PRD and `epics.md` was done by
> the approved 2026-08-29 correct course and is **not** re-litigated; this is
> the delta.

---

## 1. Issue Summary

### Change trigger

Three things converged after the 2026-08-29 v1.5 BA alignment:

1. **The Access Control Kernel MVP is built and headless.** `AppModule` resolves
   `AccessControlFacade` (ACM-8), but `user-management.module.ts` still binds
   `ACCESS_CONTROL_PORT` to `InterimAccessControlAdapter`, which authorizes
   `isAllowedForTarget` as `Boolean(userId)` — **every authenticated session
   reads every full `User` profile** — and authorizes the no-target `isAllowed`
   by an `actor.position === 'HR Admin'` string check that `access-control.md`
   and AD-4 prohibit.
2. **The 2026-08-29 correct course explicitly left three v1.5 follow-ups
   undone:** *"Implementation story specs and compiled epic contexts — Stale
   after BA correction; regeneration is a separate handoff and must pass AD-1
   human approval gates."* Those 13 `spec-*.md` and 4 `epic-*-context.md` files
   still describe `POST /users` registration, generic deactivation,
   PP/direct-UM-only timeline writes, and hard-deleted mentorship.
3. **The integration contract between User Management and Access Control was
   open.** Phase A (architect) answered it —
   `um-integration-contract-response.md` + the adoption SPEC package — and handed
   the PM the fold-in list (`architect-handoff-phase-b.md`).

### Evidence

| Source | Evidence |
| --- | --- |
| `services/backend/src/user-management/user-management.module.ts` | `ACCESS_CONTROL_PORT` bound to `InterimAccessControlAdapter` (Phase A read). |
| `services/backend/src/user-management/infrastructure/interim-access-control.adapter.ts` | `isAllowedForTarget` returns `Boolean(userId)`; `isAllowed` does an `actor.position === 'HR Admin'` check. |
| `docs/architecture/access-control.md` §"User Management adoption seam" (Phase A) | The facade is headless; adopting it for `/users/:id` is a UM-owned slice (AD-2). |
| `_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md` CAP-8/ACM-0, seeded set | Seeded FR catalog is exactly `user-management:create/deactivate/list`. DEC-UM-007 "canonical at write". DEC-UM-009 "import reuses root User id". |
| `_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md` + `stories.yaml` | The authoritative per-route contract: CAP-1 rebind, CAP-2 read/write mapping, CAP-3 minimal S1-card projection, CAP-4 real-consumer E2E; stories `UMAC-1/2` (`UMAC-3` removed 2026-09-01). |
| `sprint-change-proposal-2026-08-29.md` §2, §4 Proposal 3/4 | v1.5 PRD/epics aligned; specs + contexts left stale by design. |
| `_bmad-output/implementation-artifacts/user-management/spec-1-1…4-2` | 13 pre-v1.5 specs with `status: in-review`/`ready-for-dev`, stale `baseline_commit`, `POST /users`, deactivation, mentorship. |
| ARCHITECTURE-SPINE.md AD-19 (Journal gate), AD-21 (amended 2026-08-31) | Epic 4 PP/journal work blocked on CC-07; interim-adapter retirement owned by the adoption slice. |
| `um-integration-contract-response.md` Q3 CRITICAL FLAG | No `user-management:edit` / photo permission exists — the §2.2 dual gate for writes cannot pass under the real facade. |

### Problem statement

The BA layer says v1.5, but (a) the real facade is not consumed, so `/users/:id`
has no production access control; (b) the compiled implementation artifacts still
describe pre-v1.5 behaviour, so a dev/story-authoring pass starting from them
would build the wrong thing; and (c) the adoption work has no home in the epic
plan and its one Product decision (the missing edit permission) is unrecorded.

---

## 2. Impact Analysis

### Epic impact

| Epic | Impact |
| --- | --- |
| **UM Epic 0 — Access Control Adoption (NEW)** | Added. Rebinds `ACCESS_CONTROL_PORT` to a real facade-backed adapter, deletes the interim adapter (AD-21), adopts the `GET /users/:id` read path now (`200` S1 identity card for any non-empty audience incl. `colleague`; empty audience → leak-free `404`) plus the S1-card DTO, and the `PATCH`/`PUT photo` dual gate once a permission exists. Stories 0.1 (read + S1-card DTO, can start now), 0.2 (write, conditional). *(Story 0.3 colleague-flip removed 2026-09-01 — §7 (ii).)* |
| UM Epic 1 — Employee Record Management | Story 1.1 gains ACM-0 / DEC-UM-007 canonical-at-write / DEC-UM-009 constraints. Story 1.2's authorization ACs are **satisfied by Epic 0** (1.2 asserts data correctness). No Story 1.4 (generic deactivation retired). |
| UM Epic 2 — Magic-Link Authentication | Unchanged in scope; now explicitly **owns retiring the interim session resolver** (separate from Epic 0's interim access-control adapter). |
| UM Epic 3 — Career Timeline | Stories 3.2/3.3 renamed to v1.5 titles; gate stated as the §2.2 dual gate (edit-the-career-timeline permission + DEC-UM-001 narrowed S9 write audience: assigned PP + direct Unit Manager). |
| UM Epic 4 — Organisational Relationships | Every story's stage-2/production (journal-writing) work blocked on **CC-04 AND CC-07** (AD-19 Journal gate), not CC-04 alone. Story 4.2 is the v1.5 People Partner op (mentorship 4.2 retired to a future context). Story 4.3 is new. AD-19 Department-boundary gate noted. |
| UM Epic 5 — Employment Lifecycle | Compiled context + specs added (5.1, 5.2); implementation blocked on CC-06. |
| Future Mentorship epic | Still receives the durable pair workflow removed from UM. |

### Artifact impact

This whole 3-phase pass (Phase A architect + this PM phase + the coming TEA
phase). Phase A files are already applied; PM files are proposed here; TEA files
are a forward reference.

**Phase A — already applied (from `architect-handoff-phase-b.md` §4):**

| Artifact | Change |
| --- | --- |
| `_bmad-output/implementation-artifacts/access-control/um-integration-contract-response.md` | NEW — six-question answer |
| `_bmad-output/implementation-artifacts/access-control/architect-handoff-phase-b.md` | NEW — this PM phase's brief |
| `_bmad-output/specs/spec-user-management-access-control-adoption/{SPEC.md,stories.yaml,.memlog.md}` | NEW — authoritative adoption contract + `UMAC-1/2/3` dispatch entries |
| `architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md` | AD-21 amendment (interim-adapter retirement owned by the adoption slice; session resolver is Epic 2; write path blocked on missing permission) + 1 memlog line |
| `architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md` | 1 Decision Register row repointed at the adoption spec + 1 memlog line |
| `_bmad-output/specs/spec-access-control-facade-audience-resolution/SPEC.md` | 1 resolved-pointer constraint bullet |
| `_bmad-output/specs/spec-access-control-audience-foundation/SPEC.md` | Open-Questions resolved-pointer |
| `docs/architecture/access-control.md` | NEW "User Management adoption seam" subsection |
| `docs/architecture/api-conventions.md` | 1 edit making "no `POST /users` create" explicit |

**PM phase — proposed by this document:**

| Artifact | Change |
| --- | --- |
| `_bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/prd.md` | FR-16 (adoption), FR-17 (Profile Projection), FR-9 refinement (S1 dual gate), Scope adoption seam, Data Model DEC-UM-007/009/ACM-0, FR-1/FR-5 kernel reality, `UserEvents` DEC-UM-001 narrowed write, Open Questions CC-07 + missing-permission decision. + 4 memlog lines. |
| `_bmad-output/planning-artifacts/user-management/epics.md` | Epic 0 added (list + detailed section + 3 stories); FR-16/FR-17 in Requirements Inventory + FR Coverage Map; Epic 1 Story 1.1 kernel-reality constraints, Story 1.2 "authorization is Epic 0's" note; Epic 4 CC-07 Journal gate on 4.1/4.2/4.3 + Department-boundary gate; Epic Sequencing rewritten for Epic 0. |
| `_bmad-output/implementation-artifacts/user-management/sprint-status.yaml` | `epic-0` + `0-1/0-2/0-3` + `epic-0-retrospective` at `backlog`; `# retired:` comments for old 1.4 (deactivation) and old 4.2 (mentorship). Everything `backlog`. STATUS DEFINITIONS header kept. |
| 13 compiled `spec-*.md` | Regenerated `status: draft` from `epics.md` v1.5; `baseline_commit` dropped; header "Regenerated 2026-09-01 … NOT an AD-1 approval"; frozen blocks re-opened. Retired-with-pointer: old 1.1, 1.4, 3.2, 3.3, 4.1, 4.2. New v1.5 slugs: `spec-1-1-import-seeded-population`, `spec-3-2-authorized-actor-manually-adds-a-backfill-entry`, `spec-3-3-authorized-actor-edits-or-deletes-an-event`, `spec-4-1-change-an-employee-s-manager`, `spec-4-2-change-an-employee-s-people-partner`. New stories: `spec-4-3-…`, `spec-5-1-…`, `spec-5-2-…`. Epic 0 has **no separate compiled spec** — it points at the adoption SPEC (stated in `epic-0-context.md`). |
| 4 → 6 `epic-*-context.md` | `epic-1..4` regenerated `status`-equivalent (compiled context, no frontmatter status field); `epic-0-context.md` (pointer to the adoption SPEC) and `epic-5-context.md` NEW. |
| `docs/architecture/user-management-test-decisions.md` | DEC-UM-003 reframed (seed/import writer); DEC-UM-006 RETIRED (no `POST /users`); DEC-UM-008 RETIRED (no registration dispatch); DEC-UM-007 KEPT + reconciled to "writer-side canonical; DB functional index deferred"; DEC-UM-009 KEPT + reframed to the seed/import writer + ACM-0 root-id reuse; DEC-UM-002 principle carried to the adoption adapter; DEC-UM-001/005 v1.5 mappings added; Traceability table drops `um-reg-*`, adds `um-seed-*`. |

**Mentorship bounded-context planning — appended 2026-09-01 (separate PM pass; see §4.8):**

| Artifact | Change |
| --- | --- |
| `_bmad-output/planning-artifacts/prds/prd-mentorship-2026-09-01/prd.md` (+ `.memlog.md`) | NEW `draft` — decomposes People Management PRD FR-32/33/34 (§4.12) + requirements §4.11 into the `mentorship` context. FR-M1..FR-M17; 7 open questions. |
| `_bmad-output/planning-artifacts/mentorship/epics.md` (+ `.memlog.md`) | NEW `draft` — Epic 1 Mentorship Hub, 6 stories, per-story gates (G-CTX/G-PERM/G-S13/G-CT/G-DEP). |
| `_bmad-output/planning-artifacts/mentorship/architect-handoff.md` | NEW — 10 technical questions for the architect pass. |
| `_bmad-output/implementation-artifacts/mentorship/sprint-status.yaml` | NEW — `epic-1` + 6 stories + retrospective at `backlog`. |
| `docs/test-cases/mentorship/` | NEW — `README.md` + 27 unapproved-draft scenario files (`flag/` 4, `pool/` 3, `pair/` 5, `end/` 8, `view/` 5, `departure/` 2). No `approvals.yaml`. |
| `_bmad-output/planning-artifacts/user-management/epics.md` | "Mentorship Handoff" placeholder replaced with a pointer to the new package. |
| `_bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md` (+ `.memlog.md`) | §4.12 pointer line to the bounded-context decomposition. |
| `docs/test-cases/user-management/relationships/README.md`, `um-rel-04/05/06` headers | Pointer updated to name `docs/test-cases/mentorship/` as the new home. |
| `_bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/.memlog.md` | 1 line — the "future mentorship context" Scope line now has a home. |

**Mentorship bounded-context architecture — appended 2026-09-01 (architect pass; see §4.8):**

| Artifact | Change |
| --- | --- |
| `docs/architecture/mentorship.md` | NEW `draft` — the binding companion doc for the `mentorship` context: layout, the `MentorshipPair` + `MentorshipAvailability` aggregates (fields/consumers/indexes), the fixed endpoints, the three cross-context seams (career events, departure executor, AccessControl), fail-closed invariants, and a 10-row Decision register. |
| `architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md` | AD-5 amendment (mentorship confirmed) + AD-17 refinement note (status SoT, `endedByDepartureId` marker, `MentorshipAvailability` aggregate, derived status) + Deferred "S13 flag endpoint" retired + Deferred "S10/S15" mentorship clause updated + ERD (`MentorshipAvailability`, `endedByDepartureId`) + 1 `.memlog.md` line. |
| `docs/architecture/domain-driven-design.md` | `mentorship` moved to the confirmed context list + one-line description. |
| `docs/architecture/database-schema.md` | `MentorshipPair` section updated (status SoT, `CHECK`s, index list, `closedBy` dropped, `endedByDepartureId`) + NEW `MentorshipAvailability` section + additive-migration-ordering note + ERD edit. |
| `docs/architecture/api-conventions.md` | §3.2 S13 row filled (`POST /mentorship-pairs/:id/end`, `GET /mentorship-pool`, `GET/PATCH /users/:id/mentorship-availability`) + `mentorship-pool` added to shape-2 top-level collections + `mentorship-availability` added to shape-3 field-groups + collection-member-action note. |
| `docs/architecture/access-control.md` | NEW matrix-exceptions row (S13 closure-note visibility — reporting + project + PP only) + a note that `canAccessSection('S13')` is a pending increment mentorship depends on. |
| `_bmad-output/implementation-artifacts/access-control/deferred-work.md` | NEW entry — "S13 `canAccessSection` support" (Access-Control-owned increment, same class as the S9 gap). |
| `_bmad-output/planning-artifacts/mentorship/architecture-notes.md` | NEW `draft` — records why a `spec-mentorship-hub` package is deferred (Decisions 1/3 undecided; G-CT/G-DEP boundaries not built) and when it becomes meaningful. **No spec package created.** |
| `_bmad-output/planning-artifacts/um-ac-alignment-traceability-2026-09-01.md` | NEW Section E — every §4.11 rule / FR-M / PRD FR-32/33/34 mapped to its landing site + contradiction check. |

**TEA phase — forward reference (not in this proposal's scope):**

| Artifact | Expected change |
| --- | --- |
| `docs/test-cases/user-management/` | Refresh: retire the `registration/` and `deactivation/` folders; add `seed/`, `access-control-adoption/`, `relationships/`, `departure/`; realign `career-timeline/` case ids to the v1.5 dual-gate actor set; align `profile/` to "data correctness only" + Epic 0 for entitlement. |
| `_bmad-output/specs/spec-user-management-test-cases/SPEC.md` | TEA realigns this companion of `user-management-test-decisions.md`. |
| An E2E audit | `_bmad-output/test-artifacts/e2e-actual-state-audit-2026-09-01.md` (authoritative). Audited backend state: submodule branch `dn-um-2`, HEAD `e9d80ec` — this one branch carries **both** the pre-v1.5 UM stage-2 specs **and** the full AC Kernel MVP. Findings: `registration.e2e-spec.ts` and `deactivation.e2e-spec.ts` retire (contradict v1.5); the `/users` CRUD controllers **are** built and wired, so `registration`/`profile`/`deactivation`/`list` specs currently **pass** against the interim adapter (the read leak); `profile.e2e-spec.ts` `Bearer <token:Bob>` literals break under the real facade and need real seeded personas + `Relationship` rows; `auth`/`career-timeline`/`relationships` routes are not built (404). Earlier `865df5f` / "Prisma-and-test-intent-only" characterisations in `critical-review-existing-artifacts.md` and `test-design-progress-system.md` are superseded by this audit. |

### Technical impact

**None executed.** No application code, schema, migration, seed, or test file is
modified. `services/backend` is untouched.

### UX impact

**None.** No screen, workflow, or frontend artifact is in scope. The
organisational-relationship screen and departure UI referenced in Epics 4/5 have
no UX contract yet (no `bmad-ux` run) — recorded for later.

---

## 3. Recommended Approach

**Direct Adjustment.** Patch the PRD and epic plan in place, add Epic 0, and
regenerate the stale compiled artifacts against the reconciled `epics.md`.
Preserve the approved v1.5 alignment, the adoption SPEC package, and all
architecture decisions.

| Option | Evaluation |
| --- | --- |
| **Direct Adjustment** | **Selected.** Medium effort, low risk (planning only), preserves the v1.5 work and the adoption contract. |
| Rollback | Not viable — nothing is implemented to roll back, and it would discard the adoption SPEC and the v1.5 alignment. |
| Absorb adoption into Epic 1 | Rejected — it is a cross-cutting port-rebind cutover touching the same controller as Story 1.2 and needs its own real-consumer E2E (architect handoff §1); burying it hides the AD-21 cutover and the missing-permission decision. |
| Leave specs stale, regenerate later | Rejected — the 2026-08-29 course already deferred this once; the specs are `in-review`/`ready-for-dev` and would be mistaken for approved v1.5 contracts. |

MVP is not reduced. Nothing is added beyond v1.5 — Epic 0 makes the aspirational
NFR-4 concrete; Profile Projection was already split out in `deferred-work.md`.

---

## 4. Detailed Change Proposals

### 4.1 — The adoption package (Phase A, already applied — recorded here for the reviewer)

The authoritative contract is
`_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md`:

- **CAP-1** — rebind `ACCESS_CONTROL_PORT` in `user-management.module.ts` to a
  real `@Injectable()` adapter in `src/user-management/infrastructure/` that
  injects `AccessControlFacade` forwards across the AD-2 boundary; **delete
  `interim-access-control.adapter.ts` in the same change** (AD-21). `isAllowed`
  delegates straight to the facade — the three no-target features
  (`user-management:create/deactivate/list`) are exactly the ACM-1 seeded keys.
- **CAP-2 read** — `GET /users/:id` returns `200` with the **S1 identity card**
  for **any** non-empty audience (`self`/`reporting`/`pp`/**`colleague`** —
  §3.2's S1 row is `R` for the Colleague column); the only denial is an empty
  audience set → leak-free `404`. *(Revised 2026-09-01: the earlier "two-state
  colleague rule" is removed — see §7 (ii), RESOLVED.)*
- **CAP-2 write** — `PATCH /users/:id` and `PUT /users/:id/photo` behind the
  §2.2 dual gate (`isAllowed(viewer, <edit key>)` **and**
  `canAccessSection(viewer, 'S1', target) === 'write'`), plus §3.2 fn 1
  rejection of manager/PP/department fields, plus photo Self-only. **Blocked on
  a missing permission** — see §7 decision (i).
- **CAP-3** — minimal **S1 identity-card projection** ships in Story 0.1: the
  S1-card DTO (`id`, `firstName`, `lastName`, `photo`, `position`, `country`,
  `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`;
  drops `ttId`, `isActive`, `customFields`, `createdAt`, `createdBy`) is a
  dedicated mapper on the `GET /users/:id` handler only — **not** a rewrite of
  the shared `toUserResponse` (the list / `POST` / `PATCH` / `DELETE` / photo
  response bodies are unchanged). The *further* FR-17 narrowing (S10
  dates-only, S11 name-only, S16 per-field, S7/S8 flags, S1 derived-field
  immutability) stays the separate deferred Profile Projection story, decoupled
  from `GET /users/:id`. *(Revised 2026-09-01 — see §7 (ii), RESOLVED.)*
- **CAP-4** — real-consumer HTTP → router → session → AccessControl → PostgreSQL
  E2E, no provider overrides (AD-3).

Dispatch entries `UMAC-1` (read + rebind + S1-card DTO), `UMAC-2` (write dual
gate, CONDITIONAL) in `stories.yaml`. `UMAC-3` (colleague-flip) was **removed
2026-09-01** (§7 (ii)). Nothing approved; `approvals.yaml` for that package does
not exist yet.

### 4.2 — UM PRD

FR-16 (adoption), FR-17 (Profile Projection), FR-9 refinement (S1 dual gate);
Scope gains the adoption seam; Data Model gains DEC-UM-007 canonical-at-write,
DEC-UM-009 root-id reuse, and the ACM-0 ordering; FR-1/FR-5 fold in kernel
reality; `UserEvents` prose states the DEC-UM-001 narrowed manual-write audience;
Open Questions gain CC-07 and the missing-`user-management:edit`-permission
decision. 4 memlog lines appended.

### 4.3 — epics.md

Epic 0 added as a dedicated epic (list entry + detailed section + Stories
0.1/0.2 mirroring `UMAC-1/2`; Story 0.3 / `UMAC-3` removed 2026-09-01),
cross-referencing the adoption SPEC as the binding contract. FR-16/FR-17 added to
the Requirements Inventory and the FR Coverage Map (FR-16 now includes the S1-card
projection; FR-17 shrinks to the S10/S11/S16 colleague views on their own
surfaces, decoupled from `GET /users/:id`). Epic 1 Story 1.1 gains the
ACM-0/DEC-UM-007/009 constraints and the concrete `docs/Accounts_template.csv`
import source + column→field mapping; Story
1.2 gains the "authorization is Epic 0's" note. Epic 4 gains the CC-07 Journal
gate on Stories 4.1/4.2/4.3 (stage-2/production blocked; scenario prose may
proceed) and the AD-19 Department-boundary gate note. Epic Sequencing rewritten:
Epic 0 read path can start now (ACM-8), write path waits on the permission
decision. There is no Story 0.3 (the colleague read is a positive `200` from
Story 0.1).

### 4.4 — Compiled specs + epic contexts

13 `spec-*.md` regenerated `status: draft` with the header "Regenerated
2026-09-01 from epics.md v1.5 — supersedes the pre-v1.5 version; NOT an AD-1
approval." `baseline_commit` dropped everywhere. `<frozen-after-approval>` blocks
re-opened for v1.5 renegotiation (their pre-v1.5 content — `POST /users`,
interim-permissive `isAllowedForTarget`, mentorship — does not survive v1.5 and
is not restated). Retired-with-pointer: old 1.1, 1.4, 3.2, 3.3, 4.1, 4.2. New
v1.5-slug files created for 1.1, 3.2, 3.3, 4.1, 4.2; new specs for 4.3, 5.1, 5.2.
`epic-1..4-context.md` regenerated; `epic-0-context.md` (points at the adoption
SPEC — no separate compiled spec for Epic 0) and `epic-5-context.md` created.

These are **compiled planning context** for a future dev/story-authoring pass —
**not** AD-1 stage-1 scenario docs (those are `docs/test-cases/user-management/`
and the TEA phase's job).

### 4.5 — sprint-status.yaml

`epic-0` + `0-1-adopt-read-path-and-rebind-port` +
`0-2-adopt-write-path-dual-gate` + `epic-0-retrospective` added at `backlog`.
`# retired:` comments for old 1.4 (deactivation), old 4.2 (mentorship), and
`0-3-flip-colleague-to-allow-narrowed` (removed 2026-09-01 — §7 (ii)).
Everything `backlog` — nothing is implemented to v1.5. STATUS DEFINITIONS header
preserved.

### 4.6 — user-management-test-decisions.md

DEC-UM-003 reframed to the seed/import writer; DEC-UM-006 and DEC-UM-008
RETIRED (no `POST /users`, no registration dispatch — with pointers to the seed
story); DEC-UM-007 KEPT and reconciled from "uniqueness enforced on the
normalized value" to "writer-side canonical; DB-enforced functional unique index
is deferred work", **plus the concrete import source `docs/Accounts_template.csv`
(semicolon-delimited TT export; normalization applies to the `Email` column;
keyed by normalized `Email` — no id column; `ttId` left `null`)**; DEC-UM-009
KEPT and reframed to the seed/import writer + ACM-0 root-id **update-in-place**; DEC-UM-002 records that generic deactivation is retired but
the no-role-name-checks principle carries to the adoption adapter; DEC-UM-001
and DEC-UM-005 get v1.5 mappings; Traceability drops `um-reg-*`, adds `um-seed-*`.

### 4.7 — Forward reference: the TEA phase

Not in this proposal's scope. The TEA phase refreshes
`docs/test-cases/user-management/` and realigns
`spec-user-management-test-cases/SPEC.md`, and runs the E2E audit of the
pre-v1.5 stage-2 specs. Epic/story **key names** it must match are in §6.

### 4.8 — Mentorship bounded-context planning (added 2026-09-01)

A **separate PM pass** created the planning home for Mentorship, which the
2026-08-29 Correct Course and AD-17 moved out of `user-management` (the former
UM Story 4.2, `POST /users/:id/relationships {type:'mentorship'}`, is retired).
It is appended here, not merged into §§4.2–4.6 — nothing in this proposal's
User Management scope changes.

- **NEW `draft`:** `prd-mentorship-2026-09-01/prd.md` (FR-M1..FR-M17, mirrors
  `prd-user-management-2026-08-20` shape), `planning-artifacts/mentorship/epics.md`
  (Epic 1: Mentorship Hub, 6 stories), `mentorship/architect-handoff.md`,
  `implementation-artifacts/mentorship/sprint-status.yaml`,
  `docs/test-cases/mentorship/` (README + 27 unapproved-draft scenario files; no
  `approvals.yaml`).
- **Reconciled:** the UM `epics.md` "Mentorship Handoff" placeholder now points
  to the package; the People Management PRD §4.12 gains a decomposition pointer;
  `docs/test-cases/user-management/relationships/` README + `um-rel-04/05/06`
  headers name `docs/test-cases/mentorship/` as the home.
- **Gates carried (no new blockers invented):** the *assign and end mentorships*
  FR permission is unseeded — **same shape as Open Decision (i)** (missing
  `user-management:edit`); the S13 `canAccessSection` increment is pending in
  Access Control — **same class as the career-timeline S9 gap**; departure
  auto-close is blocked on **CC-06 / the AD-20 executor**; the career-event
  boundary needs **UM Epic 3 Story 3.1**; the `MentorshipPair` schema and the
  open-to-mentoring flag's owning aggregate/endpoint (spine Deferred) are
  **architect** decisions.
- **Nothing approved.** All mentorship planning artifacts are `draft`; scenario
  files need per-file AD-1 human approval. The architect pass owns the technical
  context design (`mentorship/architect-handoff.md`).

**Architecture design — completed 2026-09-01 (this pass).** The architect pass
answered all ten `architect-handoff.md` questions:

- **`docs/architecture/mentorship.md`** (NEW `draft`) is the binding companion
  doc — aggregates, schema, endpoints, cross-context seams, invariants, and a
  10-row Decision register.
- **Aggregates:** `MentorshipPair` — `status ('active'|'ended')` is the lifecycle
  SoT; `endedByDepartureId` (nullable `uuid`, **no DB FK**) is the system-closed
  marker + AD-20 idempotency provenance; `closedBy` dropped (no consumer).
  `MentorshipAvailability {userId PK, openToMentoring bool}` — the flag as its
  own per-user aggregate (resolves the spine Deferred "S13 flag endpoint").
  Mentorship status is **derived, never stored**.
- **Routes fixed:** `POST /mentorship-pairs/:id/end {closureNote}` (shape-2
  collection-member action, not a fifth shape); `GET /mentorship-pool`
  (top-level, read-only); `PATCH /users/:id/mentorship-availability` (shape 3,
  Self-only — **not** a `Relationship` patch).
- **Seams:** the `appendCareerEvent({tx,…})` contract mentorship needs from UM
  Epic 3 Story 3.1 (same transaction, no event bus); `applyDepartureEffects
  ({departureId, departingUserId, effectiveDate, leaseToken, tx})` exported to
  the AD-20 executor (no nested tx, `status='active'` predicate = idempotency
  key); `resolveAudiences` for mentee-scoping + closure-note narrowing;
  `isAllowed('mentorship:assign')` for the pool + assign/end.
- **Spine + companion amendments applied** (see the artifact-impact table above).
- **No spec package** — deferred (`mentorship/architecture-notes.md`) until
  Decisions 1 & 3 are taken and the G-CT boundary contract is approved.
- **New technical gates for §7:** (vii) unseeded `mentorship:assign` permission;
  (viii) the S13 `canAccessSection` increment.

---

## 5. Dependency Graph

```
ACM-8 (done, facade DI-resolvable from AppModule)
   └─> Epic 0 Story 0.1 (read path + port rebind + interim adapter deletion)  ── can start now
           └─> Epic 0 Story 0.2 (write dual gate)
                   requires  Open Decision (i): missing user-management:edit permission
                     ├─ option (a): NEW Access Control kernel seed AD-1 sequence
                     │              (scenario → red-tests → production) adds
                     │              user-management:edit (± photo key) to the
                     │              bootstrap catalog + grant, THEN Story 0.2 consumes it
                     └─ option (b): Story 0.2 ships a // INTERIM adapter rule
                                    with a recorded expiry trigger

Deferred Profile Projection story (deferred-work.md): the S10 dates-only / S11
   name-only / S16 per-field colleague views on their OWN surfaces, S7/S8 flags,
   S1 derived-field immutability.  NO edge into Epic 0 — decoupled from
   GET /users/:id by the 2026-09-01 decision (Story 0.3 / UMAC-3 removed).

Epic 0 Story 0.1 (read path + port rebind + interim adapter deletion + minimal
   S1-card DTO)  ── satisfies ──>  Epic 1 Story 1.2 authorization ACs
                                   (1.2 asserts data correctness only)

ACM-0 (npm run db:seed) creates the normalized active root User
   └─> Epic 1 Story 1.1 import of docs/Accounts_template.csv (semicolon-delimited
                                   TT export; keyed by normalized Email — no id
                                   column; ttId left null)
       ── a CSV row matching ROOT_WORK_EMAIL updates the root User in place
          (DEC-UM-009); writer-side canonical workEmail (DEC-UM-007)

CC-04 (PP persistence/cardinality/write contract)  ┐
CC-07 (AD-19 journal schema / snapshot / txn contract) ┤──> Epic 4 Story 4.2 stage-2/production
CC-07                                                   ├──> Epic 4 Story 4.1 journal stage
CC-07  +  Department edge contract (spine Deferred)     └──> Epic 4 Story 4.3 journal + dept-access

CC-06 (scheduled-departure state + executor + idempotency)  ──> Epic 5 Stories 5.1, 5.2

Epic 2 Story 2.2  ── retires ──>  interim-session-resolver.adapter.ts
                                  (Epic 0 keeps it, uses Bearer <token:<uuid>> fixtures meanwhile)

Mentorship context (prd-mentorship-2026-09-01 / mentorship/epics.md — §4.8):
  architect design (docs/architecture/mentorship.md + spine/companion amendments)  ── DONE 2026-09-01 ──>  G-CTX lifted for stage-1; unblocks the 27 scenario files' AD-1 approval
  Open Decision (vii): unseeded mentorship:assign permission
    ├─ option (a): NEW Access Control kernel seed AD-1 sequence adds mentorship:assign  ──>  Mentorship Story 1.2/1.3/1.4 stage-2
    └─ option (b): mentorship ships a // INTERIM rule with an expiry trigger
  Open Decision (viii): S13 canAccessSection increment (Access-Control-owned, deferred-work.md; same class as career-timeline S9)
    ├─ option (a): NEW Access Control increment adds canAccessSection('S13')  ──>  Mentorship Story 1.4 (closure-note base), 1.5 (S13 inline)
    └─ option (b): mentorship ships a resolveAudiences-derived // INTERIM rule with an expiry trigger
  UM Epic 3 Story 3.1 (career-event application boundary — contract in mentorship.md §5.1)  ──>  Mentorship Story 1.3 (mentorship_start), 1.4 (mentorship_end)
  CC-06 + AD-20 departure executor (applyDepartureEffects, mentorship.md §5.2)  ──>  Mentorship Story 1.6 (departure auto-close)  [scenario prose only until then]
  Decisions 1 & 3 taken + G-CT boundary contract approved  ──>  spec-mentorship-hub package becomes meaningful (mentorship/architecture-notes.md)
```

---

## 6. Implementation Handoff

### Role ownership

| Recipient | Responsibility |
| --- | --- |
| Product Owner / approver | Approve this proposal; take Open Decisions §7 (i)–(vi); sign §8. |
| Product Manager (this phase) | Owns the reconciled PRD, `epics.md`, sprint-status, compiled specs/contexts, and this proposal. |
| System Architect | Owns CC-04, CC-06, CC-07, the Department edge contract; **and, if §7 (i) is option (a), owns the new Access Control kernel seed AD-1 sequence** for `user-management:edit`. Owns the adoption SPEC package as the authoritative contract. |
| TEA phase | Refreshes `docs/test-cases/user-management/`, realigns `spec-user-management-test-cases`, runs the E2E audit — after this proposal is approved and the compiled artifacts are in. |
| Dev owners | Do not use the pre-v1.5 specs. Regenerated specs are `draft` — each story still runs its three AD-1 stages with independent human approval. |
| Mentorship feature owner | Creates the dedicated durable-pair epic before mentorship implementation resumes. |

### What stays blocked

- **Epic 0 Story 0.2 (write path)** — until Open Decision (i) and, under option
  (a), the new kernel seed sequence reaching `stage-3-production`.
- ~~**Epic 0 Story 0.3**~~ — **removed 2026-09-01** (§7 (ii)): the colleague
  `GET /users/:id` read is a positive `200` (S1 identity card) from Story 0.1;
  there is nothing to flip. The deferred FR-17 Profile Projection story keeps
  only the S10/S11/S16 colleague views on their own surfaces, decoupled from
  `GET /users/:id`.
- **Epic 4 Stories 4.1/4.2/4.3 journal-writing stages** — until CC-07.
- **Epic 4 Story 4.2** — additionally until CC-04.
- **Epic 4 Story 4.3 department-derived access** — additionally until the
  Department edge contract.
- **Epic 5 Stories 5.1/5.2** — until CC-06.
- **The product access gate** stays open until Epic 0 **and** the separate
  Profile Projection story land, plus everything in the Kernel MVP's own
  deferred list.

### What can proceed now

- Epic 0 Story 0.1 scenario prose (AD-1 stage 1).
- Epic 1 Stories 1.1, 1.3, 1.5 and Epic 2 — scenario/dev work (data correctness;
  entitlement deferred to Epic 0).
- Scenario prose (AD-1 stage 1 only) for Epic 3, Epic 4, Epic 5.

---

## 7. Open Decisions for the approver

| # | Decision | Options / recommendation |
| --- | --- | --- |
| **(i)** | **Missing `user-management:edit` (and photo) permission.** The seeded FR catalog is exactly `create/deactivate/list`; the write dual gate cannot pass under the real facade. | **(a, recommended)** Access Control adds `user-management:edit` (± a photo key) to the bootstrap catalog + grant via a **new three-stage AD-1 seed sequence in the kernel package**; Epic 0 Story 0.2 then consumes it. One extra kernel sequence + one seed/migration touch; correct on first adoption; AD-21 satisfied in one pass. **(b)** Adopt READ now; keep `EDIT`/`UPLOAD_PHOTO` on a narrow `// INTERIM` rule in the real adapter with a recorded expiry trigger. Closes the read leak immediately; second cutover later; AD-21 only partly satisfied. |
| **(ii)** | ~~**Two-state colleague rule confirmation.** `GET /users/:id` for a colleague: deny the whole-profile read now (`403`, recorded temporary), then allow narrowed to the §3.3.4 whitelist once Profile Projection reaches `stage-3-production`.~~ **RESOLVED 2026-09-01 (human product decision).** A colleague `GET /users/:id` returns the **S1 identity card** (`200`) from adoption **Story 0.1** — §3.2's S1 row is `R` for the Colleague column, and the matrix legend makes every active authenticated viewer at least a Colleague. There is no "two-state" rule and no flip. Adoption story **`UMAC-3` / Story 0.3 is removed**. Story 0.1 ships the minimal S1-card projection (`id`, `firstName`, `lastName`, `photo`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate` — dropping `ttId`, `isActive`, `customFields`, `createdAt`, `createdBy`). The only `GET /users/:id` denial is an empty audience set → leak-free `404`. FR-17 Profile Projection keeps only the S10 dates-only, S11 name-only, and S16 per-field colleague views **on their own surfaces**, plus S7/S8 flags and S1 derived-field immutability. | *(audit trail retained above; decision recorded)* |
| **(iii)** | **Epic 0 vs Story 1.0 placement.** The adoption work as a dedicated **Epic 0** (recommended, architect handoff §1) vs a Story 1.0 inside Epic 1. | Recommendation: dedicated Epic 0 — it is a cross-cutting cutover with its own real-consumer E2E and its own conditional/triggered stories. |
| **(iv)** | **Interim session resolver — in scope for Epic 0 or Epic 2?** | Recommendation: **Epic 2** (Magic-Link Authentication) owns retiring `interim-session-resolver.adapter.ts`; Epic 0 keeps it and uses the `Bearer <token:<seeded-uuid>>` fixture convention. AD-21's interim-adapter clause refers to the *access-control* adapter, retired by Epic 0. |
| **(v)** | **Photo write: Self-only or manager-writable?** FR-9 says "Self can directly write only the photo." | Recommendation: **Self-only** — a reporting-line manager or PP may **not** replace a report's photo. Confirm before Story 0.2's photo scenario is authored. |
| **(vi)** | **Is photo a distinct permission or covered by `user-management:edit`?** §2.3 catalog names no photo permission. | Recommendation: **not separate** — photo is Self-only by FR-9, so the functional half is "editing your own row" and option (a) only needs `user-management:edit`. |
| **(vii)** | **Mentorship — the *assign and end mentorships* FR permission is unseeded** (kernel catalog = `user-management:create/deactivate/list`). The §2.2 dual gate for `POST /mentorship-pairs` and `POST /mentorship-pairs/:id/end` cannot pass under the real facade. Exactly the same shape as (i). | **(a, recommended)** Access Control adds `mentorship:assign` to the bootstrap catalog + grant via a **new three-stage AD-1 kernel-seed sequence**; mentorship Stories 1.2/1.3/1.4 consume it. **(b)** mentorship ships a `// INTERIM` rule with a recorded expiry trigger. **Related:** requirements ~line 131 lists *who may assign mentors* (the default role assignment, not the code path) as a PO-confirm item. `docs/architecture/mentorship.md` Decision 1. |
| **(viii)** | **Mentorship — S13 `canAccessSection` is a pending Access Control increment.** ACM-5 ships `S1`/`S10`/`S11` only. The FR-M10 closure-note restricted projection and the FR-M17 audience-narrowed S13 inline summary have no facade call to make for the S13 base decision. Same class as the career-timeline S9 gap. | **(a, recommended)** a new Access Control increment adds `canAccessSection('S13', …)` (tracked in `implementation-artifacts/access-control/deferred-work.md`); the closure-note narrowing stays mentorship-owned via `resolveAudiences`. **(b)** mentorship ships a `resolveAudiences`-derived `// INTERIM` rule with a recorded expiry trigger. `docs/architecture/mentorship.md` Decision 3. |
| **(ix)** | **Mentorship — product decisions the spec is silent on** (`mentorship.md` Decisions 4–7): recurring pair after ending (recommend allow; bar a second *active* pair per pair); one active mentor per mentee (recommend a partial unique index); career event on both participants' timelines vs mentee-only (recommend both); end-pair authorization audience — reporting + PP write, project line read-only (DEC-UM-001 S9 pattern). | Product Owner confirms each. None blocks stage-1 scenario approval. |

---

## 8. Approval

**Approved by Dmytro Novyk (Product Owner / Architect), 2026-09-01.** Every Open
Decision below is taken at the architect's recommended option.

- Overall proposal (Direct Adjustment, Epic 0 added, compiled artifacts
  regenerated as `draft`): **APPROVED** — Dmytro Novyk / 2026-09-01
- Open Decision (i) — missing `user-management:edit` permission: **option (a)** —
  Access Control adds `user-management:edit` to the bootstrap catalog + grant via
  a new three-stage AD-1 kernel-seed sequence; Epic 0 Story 0.2 then consumes it.
- Open Decision (ii) — two-state colleague rule + §3.3.4 whitelist scope:
  **RESOLVED 2026-09-01 — colleague `GET /users/:id` returns the S1 identity card
  in Story 0.1; two-state rule and `UMAC-3` removed; empty audience → `404`.**
- Open Decision (iii) — Epic 0 vs Story 1.0: **dedicated Epic 0.**
- Open Decision (iv) — interim session resolver owner (Epic 0 / Epic 2):
  **Epic 2** (Magic-Link Authentication) owns retiring
  `interim-session-resolver.adapter.ts`; Epic 0 keeps it with the
  `Bearer <token:<seeded-uuid>>` fixture convention.
- Open Decision (v) — photo Self-only vs manager-writable: **Self-only** — a
  reporting-line manager or PP may not replace a report's photo.
- Open Decision (vi) — photo a distinct permission (yes / no): **no** — covered
  by `user-management:edit`.
- Open Decision (vii) — mentorship `mentorship:assign` permission: **option (a)** —
  added to the bootstrap catalog + grant via a new three-stage AD-1 kernel-seed
  sequence.
- Open Decision (viii) — mentorship S13 `canAccessSection` increment: **option
  (a)** — a new Access Control increment adds `canAccessSection('S13', …)`; the
  closure-note narrowing stays mentorship-owned via `resolveAudiences`.
- Open Decision (ix) — mentorship product decisions 4–7: **all at the
  recommended option** — recurring pair after ending allowed (bar a second
  *active* pair per pair); one active mentor per mentee (partial unique index);
  career event on **both** participants' timelines; end-pair authorization
  audience = reporting + PP write, project line read-only (DEC-UM-001 S9
  pattern).

Per the closing paragraph below, this approval authorizes the §4
planning-artifact and companion-doc changes only. It authorizes **no** scenario,
test, migration, seed, production code, or `services/backend/` change, and it
does not approve any regenerated story spec — each still runs its three AD-1
stages with independent human approval recorded in its own package's
`approvals.yaml`.

Approval of this proposal authorizes applying the planning-artifact and
`docs/architecture/` companion-doc changes in §4. It authorizes **no** scenario,
test, migration, seed, production code, `services/backend/` change, or BMAD gate,
and it does not approve any regenerated story spec — each still runs its three
AD-1 stages with independent human approval.
