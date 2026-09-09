---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - docs/requirements-changelog-v1.2-to-v1.5.md
  - docs/project-requirements.md
  - _bmad-output/planning-artifacts/sprint-change-proposal-2026-08-27.md
  - _bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml
  - _bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml
  - _bmad-output/planning-artifacts/resourcing/epics.md
  - _bmad-output/implementation-artifacts/platform/sprint-status.yaml
status: final
reproducible: working-tree-only
updated: 2026-09-02
review: platform/reviews/review-cross-slice-seams-2026-09-02.md
---

# Platform Spec v1.5 Alignment — Epic Breakdown

## Overview

Cross-cutting planning/test/architecture alignment to spec **v1.5** after research merge and partial update in commit `7ed0de3`. This is **not** a fifth user-management feature epic.

**Primary delta index:** [docs/requirements-changelog-v1.2-to-v1.5.md](../../../docs/requirements-changelog-v1.2-to-v1.5.md)  
**Normative SoT:** [docs/project-requirements.md](../../../docs/project-requirements.md)  
**Sprint Change Proposal:** [sprint-change-proposal-2026-08-27.md](../sprint-change-proposal-2026-08-27.md)

**Out of scope for this epic:** application code; UM Epics 2–4 feature work; `um-seed-01`..`03` (owned by UM Story 1.1).

**Weekend MVP gate:** Platform stories below agreed before platform-wide matrix engine / dashboard engine implementation. UM continues on seeded population.

**Ratification overlay (2026-09-02):** Epic 1 stories absorb post-ratification documentation debt (denial oracle, blocker register, gate IDs, departure wording). Sprint-status keys are not changed by this CE pass. Guards G1–G5 from `platform/reviews/review-cross-slice-seams-2026-09-02.md` applied 2026-09-02.

**Post-kernel extension (2026-09-02):** Epics 5–8 are added below to decompose the access-control gaps that the Kernel MVP deliberately left open. The ratification overlay's earlier "No Epic 4" note applied to the *documentation* CE pass and is superseded for this planning pass only; it does not reopen any Epic 1 story. **Epics 2 and 3 are not modified by this pass** — their stories are implemented and their acceptance criteria are historical evidence. Epic 5–8 story text never restates, supersedes, or re-scopes an Epic 2 or Epic 3 acceptance criterion.

**Kernel MVP status caveat (verify before scheduling):** every Epic 3 story key is `done` in `_bmad-output/implementation-artifacts/platform/sprint-status.yaml`, but two tracking artifacts disagree with that and are **not** corrected by this planning pass:

- `sprint-status.yaml` still records `epic-3: in-progress` and `epic-2: in-progress` although every child story key is `done`.
- `global-fr-epic-story-coverage.yaml` records `PLAT-E2-S2.1` as `status: in-progress` while `sprint-status.yaml` records `2-1-resolve-phase-0-audiences-acf-1: done`.

Neither is an Epic 5–8 deliverable. Both are recorded here so that "PLAT-E3 is done" is not treated as mechanically verified when one of the two tracking surfaces still contradicts it. Reconciliation belongs to Platform Story 1.1's traceability matrix.

## Requirements Inventory

### Functional Requirements (platform slice)

Exactly the FRs this file owns or extends. Verbatim-sourced from PRD §4.1 / §4.8 / §4.9 and [docs/project-requirements.md](../../../docs/project-requirements.md) §2.1, §3.2, §3.3, §3.4, §5.1.

- **PM-FR-1** *[PRD §4.1 FR-1; requirements §2]*: Separate derived access roles from assigned functional roles. Epics 5–8 carry **one** testable consequence: assigning the DM or PM functional role alone does not grant a Project-line tier (PLAT-E8-S8.1). Kernel separation remains PLAT-E3-S3.4 (ACM-1); consumer adoption remains `UM-E0-S0.1`.
- **PM-FR-2** *[PRD §4.1 FR-2; requirements §2.1, §5.1]*: Resolve Reporting, Project, and People Partner access transitively with required revocation windows. Epic 8 owns Project-line derivation, column narrowness, 15 min / 4 h withdrawal, and the AD-31 read-only membership boundary. Epic 5 owns the department-management contribution to Reporting line and the `isHr`-bounded PP HR-line. Phase-0 Self / reports-to / direct PP remains ACF-1 / ACM-3 historical evidence (SD-1).
- **PM-FR-3** *[PRD §4.1 FR-3; requirements §3.2, §3.3]*: Enforce the S1–S16 section matrix. Kernel substrate S1/S10/S11 remains ACM-5 historical evidence. Epic 6 owns S2–S16 relationship-derived columns. Epic 7 owns the Shared-link column and the AD-28 overlay evaluation.
- **PM/AD-24**: HTTP denial oracle — 401 / 404 / 403 (platform Epic 1 = documentation alignment; runtime `PM-FR-4` owner is `UM-E0-S0.1` per coverage model)
- **PM-FR-36 / PM-FR-37**: TimeTracker required integration (§5.1) — documentation alignment in Epic 1; identity/population owned by `timetracker/epics.md` and gated by `TT-IDENTITY-01`
- **PM-FR-38**: PeopleForce optional prefill only (§5.2)

**Referenced but not owned by this slice** (Epics 5–8 consume or bound these; they are not platform deliverables):

- **PM-FR-27** *[PRD §4.8 FR-27; requirements §4.8]*: the **link engine** — creation, recipient authentication, expiry, revocation UI — is owned by the future profile-sharing context per `resourcing/epics.md`. Epic 7 supplies only the §3.2 *Shared link* section-policy port that engine consumes (SD-5). Coverage stays `uncovered`.
- **PM-FR-39** *[PRD §4.1 FR-39; requirements §2.4]*: `coverage_status: deferred`. Epic 7 evaluates the AD-28 **overlay** given a grant; it implements no grant, revoke, seeding, or last-holder rule (SD-6).
- **PM-FR-42** *[requirements §4.17]*: owned by `user-management` (PRD §4.0) and covered by `UM-E4-S4.3`. Epic 5 **reads** department structure for audience derivation and claims no part of PM-FR-42 (SD-4).
- **PM-FR-4** *[PRD §4.1 FR-4]*: runtime owner remains `UM-E0-S0.1` (UMAC-1, **in-progress**). No Epic 5–8 story claims it (SD-7).
- **PM-FR-5** *[PRD §4.1 FR-5; requirements §3.3.6]*: `coverage_status: specified` (2026-09-03, `user-management/epics.md` `UM-E8`/`UM-E7`) — no longer unowned, but `UM-E7` has not shipped and remains the blocking dependency for S16 (Epic 6 Story 6.6).
- **UMAC-1 / UM-E0-S0.1**: in-progress consumer adoption of the kernel. Precondition, not a deliverable of Epics 5–8.

### Non-Functional Requirements (platform slice)

- NFR-AC-1: Access Control kernel resolves 500-target audience workloads within documented ACM-9 evidence protocol (p50/p95, 2s threshold)
- NFR-AC-2: QUALITY-GATE-AC closes only when `gate_status=PASS`, `p0_status=MET`, `critical_open=0`, and ACM3-II-06 is covered
- NFR-AC-3: QUALITY-GATE-AC-NFR records ACM-9 500-target / 2s performance evidence separately from functional gate

### Additional Requirements (architecture / ratification)

- PM/AD-7: Functional-role binding identity is `Permissions.key` (unique, append-only); `title` is display-only (ACF/AD-4)
- PM/AD-24: HTTP denial oracle supersedes 2026-09-01 UMAC empty-audience 403; historical artifacts remain as evidence only
- PM/AD-28: Self / full-profile overlay design ratified; `matrix/full-profile-access/` scenarios are not authored — AD-1 dispatch required
- PM/AD-31 / ARCH-PROJ-WRITER-01: Sole writer of project membership (architecture `CC-11` superseded)
- PM/AD-34 / ARCH-ENV-01: Profile assembly + envelope (architecture `OQ-118` superseded)
- Ratification blocker register: see `blockers.yaml` (canonical ID and count source)
- CC-06 departure: apply transaction cancels **only open Action Items assigned to the departing person**
- ACF Inherited Invariants bind PM/AD-22, PM/AD-23 (`applyDepartureEffects` five-field contract), PM/AD-24

**Additional bindings introduced by Epics 5–8:**

- PM/AD-10: three manager relations, two matrix audiences; Reporting and Project line never collapse; bulk live resolution, never persisted; revocation timing (next request / 15 min / 4 h)
- PM/AD-13: `User.ttId` identity rule for TimeTracker-sourced project members (population source is `TT-IDENTITY-01`)
- PM/AD-27: ordinary project membership is not Project line and carries no `targetRole`
- PM/AD-28: Self is exclusive; full-profile is a read-only overlay, not a §3.2 column; `max(Self, overlay)` with write > read > none
- PM/AD-29: `AccessJournal` kinds include `shared_link_access`; enrolment is same-transaction. Implementation is absent (`CC-07` P0 open)
- PM/AD-35: `Department {parentId, isHr}` + `UserDepartment`; department manager is a `Policies targetType='department'` AR grant; PP HR-line walks the assigned PP's `direct` chain only while each ancestor department has `isHr=true`, otherwise fail-closed to the assigned PP
- CC-02 Option 1 (PRD FR-3): when several relationship-derived audiences apply, effective access is the strongest applicable permission per section; this never manufactures a functional permission and never bypasses a dedicated mutation gate

### UX Design Requirements

None — no `bmad-ux` contract exists for platform scope.

### FR Coverage Map

| FR / ID | Epic | Story |
|---------|------|-------|
| PM-FR-1 | PLAT-E2, PLAT-E3, PLAT-E8 | PLAT-E2-S2.1; PLAT-E3-S3.1–S3.5; PLAT-E8-S8.1 (functional role alone grants no Project-line tier) |
| PM-FR-2 | PLAT-E2, PLAT-E3, PLAT-E5, PLAT-E8 | PLAT-E2-S2.1; PLAT-E3-S3.1–S3.4; PLAT-E5-S5.1–S5.3; PLAT-E8-S8.1–S8.4 |
| PM-FR-3 | PLAT-E3, PLAT-E6, PLAT-E7 | PLAT-E3-S3.6 (S1/S10/S11); PLAT-E6-S6.1–S6.6 (S2–S16); PLAT-E7-S7.1–S7.3 (Shared link column + full-profile overlay) |
| PM/AD-24 | PLAT-E1 | PLAT-E1-S1.3, PLAT-E1-S1.4 (documentation alignment; runtime owner is UM-E0-S0.1 per coverage model) |
| PM-FR-36, PM-FR-37, PM-FR-38 | PLAT-E1 | PLAT-E1-S1.6 |
| PLAT-E1 | PLAT-E1 | PLAT-E1-S1.1–S1.9 |
| PLAT-E2 | PLAT-E2 | PLAT-E2-S2.1 |
| PLAT-E3 | PLAT-E3 | PLAT-E3-S3.1–S3.8 |
| NFR-AC-1 | PLAT-E3, PLAT-E5, PLAT-E6, PLAT-E8 | PLAT-E3-S3.8 (kernel baseline); re-baseline obligation on E5/E6/E8 — see *Post-kernel NFR re-baseline* |
| NFR-AC-2, NFR-AC-3 | PLAT-E1 | PLAT-E1-S1.6 |

**Referenced, not covered by this slice:**

| FR / ID | Epic | Coverage claim |
|---------|------|----------------|
| PM-FR-27 | PLAT-E7 | **Not covered.** Epic 7 delivers the §3.2 Shared-link section-policy port only; the link engine has no owning slice |
| PM-FR-39 | PLAT-E7 | **Not covered — deferred.** Epic 7 bounds the AD-28 overlay; grant lifecycle is not implemented |
| PM-FR-42 | — | Owned by `user-management` (`UM-E4-S4.3`). Epic 5 reads department structure and claims no part of it |
| PM-FR-4 | — | Runtime owner remains `UM-E0-S0.1` (UMAC-1). **No Epic 5–8 story claims PM-FR-4** |
| PM-FR-5 | — | Owned by `user-management` (`UM-E8`/`UM-E7`, `specified` 2026-09-03). `UM-E7` unshipped remains the blocking dependency for Epic 6 Story 6.6 (S16) |

## Epic List

> **Numbering (2026-09-09).** Epic numbers are **identities, not an execution order**, and this list is written in authoring order. `Epic 8: Project-Line Audience` therefore appears between Epic 4 and Epic 5: it was authored in the 2026-09-02 post-kernel pass as a second `Epic 4`, and was renumbered to 8 on 2026-09-09 to resolve that collision with **Epic 4: Access Control Authorization Consolidation**. The post-kernel set is consequently **Epics 5, 6, 7 and 8** wherever this document used to write "Epics 4–7".

### Epic 1: Platform Spec v1.5 Alignment

Cross-cutting planning, spec, architecture, and test-design alignment to v1.5 SoT plus 2026-09-02 ratification documentation debt. Planning artifacts only — no application code.

**FRs covered:** PM/AD-24 (documentation alignment), PM-FR-36, PM-FR-37, PM-FR-38, NFR-AC-2, NFR-AC-3

### Epic 2: Access Control Foundation

Deliver a narrow, reusable Phase-0 audience-resolution boundary without taking ownership of User Management routes.

**FRs covered:** PM-FR-1, PM-FR-2

### Epic 3: Access Control Kernel MVP

Deliver a deployable, headless Access Control kernel proven on real PostgreSQL without changing User Management routes.

**FRs covered:** PM-FR-1, PM-FR-2, PM-FR-3, NFR-AC-1

### Epic 4: Access Control Authorization Consolidation

Collapse the per-section authorisation predicates into one section-parameterised gate driven by `canAccessSection`, rename section keys to human names, and record one functional-permission composition rule. New scope from the 2026-09-03 `dn-um-implementation` code review (this addition supersedes the "No Epic 4" note above, which scoped the 2026-09-02 ratification CE pass only).

**FRs covered:** PM-FR-3 (hardening), NFR-AC-1

### Epic 8: Project-Line Audience

Derive the Project-line matrix audience from explicit PM/DM project attachments, keeping it narrower than and separate from the Reporting line.

**FRs covered:** PM-FR-2, PM-FR-1 (one testable consequence)
**Blocking gate:** `TT-IDENTITY-01` (**P0 open**)

### Epic 5: Department Walk and People Partner HR-Line

Complete the Reporting-line inputs the kernel left fail-closed: department-management access over nested department membership, and People Partner propagation bounded by the HR line.

**FRs covered:** PM-FR-2
**Blocking gate:** `DEPARTMENT-EDGE` (**P1 open**) — not closable from this epic alone; see the epic's ownership note

### Epic 6: Section Matrix Beyond the Kernel Slice

Extend `canAccessSection` from the S1/S10/S11 kernel substrate to the full normative §3.2 matrix, with every `—` cell proven absent rather than hidden.

**FRs covered:** PM-FR-3
**Blocking gates:** `AC-S9-S13` (**P1 open**) for S9, S12, S13; `AC-SECTION-MATRIX-01` (**P1 open**, registered 2026-09-03) for S2–S8 and S14–S16

### Epic 7: Shared-Link Section Policy and Full-Profile Overlay

Deliver the two §3.2 access paths that are not relationship-derived audiences: the Shared-link column consumed by an external link engine, and the AD-28 read-only full-profile overlay.

**FRs covered:** PM-FR-3
**Bounds without covering:** PM-FR-27 (port only), PM-FR-39 (deferred — design boundary only)

---

## Post-Kernel Extension (Epics 5–8) — Binding Conditions

These apply to **every** story in Epics 5, 6, 7, and 8. They are stated once and are not restated per story.

### Scope decisions (product owner, 2026-09-02)

- **SD-1 — E2/E3 stories are historical evidence.** ACF-1 and ACM-0..ACM-9 are `done` per `platform/sprint-status.yaml`. This pass does not restate, supersede, or re-scope any Epic 2 or Epic 3 acceptance criterion. Epic 5–8 stories build on that kernel; they do not reopen it.
- **SD-2 — No `ACM-*` / `ACF-*` workboard IDs.** Those identifiers are stable (PRD §0.2) and are never reassigned by a planning pass. Epic 5–8 stories are addressed only as `PLAT-E{epic}-S{story}`. Assigning workboard IDs is a human follow-up, not a deliverable.
- **SD-3 — `AC-SECTION-MATRIX-01` was proposed and unregistered; registered 2026-09-03.** It now exists in `blockers.yaml` (Access Control, P1, `blocks:` S2–S8 and S14–S16) and is a live coverage `gates:` ID on `PM-FR-3`, `PM-FR-21`, `PM-FR-22`, `PM-FR-26` and `PM-FR-35`. The same registration resolved S12 in favour of `AC-S9-S13`, whose `blocks:` list now names it. **Closing `AC-S9-S13` unblocks S9, S12 and S13 only.**
- **SD-4 — Epic 5 owns the walk only.** It does not take PM/AD-35 schema ownership and does not claim `PM-FR-42`. Completing Epic 5 does not close `DEPARTMENT-EDGE`.
- **SD-5 — Epic 7 owns the §3.2 Shared-link port, not the link engine.** `PM-FR-27` stays `uncovered`. A port is not the capability.
- **SD-6 — Epic 7 overlay evaluation only.** `PM-FR-39` grant lifecycle stays `deferred`. Story 7.3 creates no grant route, revoke route, or seeding path.
- **SD-7 — No Epic 5–8 story claims PM-FR-4.** Those epics own the audience and section *decision*. User-management owns HTTP assembly and envelope (`UM-E0-S0.1`, PM/AD-34). Whole-row `GET /users` serialization remains transition debt.
- **SD-8 — ACM-9 re-baseline on every E5/E6/E8 production story.** `QUALITY-GATE-AC-NFR` is pinned to resolver revision `f89e034`. Any change under `services/backend/src/access-control/**` invalidates that pin. A story is not `done` until an ACM-9 rerun under protocol `ACM9-MVP-v1` records `status: PASS` at 500 requested active targets with warm p95 and worst case ≤ 2 s, covering the shape the story introduced.
- **SD-9 — File-churn split is intentional.** Epics 5–8 all modify `services/backend/src/access-control/**`. They are not consolidated: the split follows risk boundaries (project identity, department schema, section matrix, overlay/share-link), not technical layers. Consolidation would hide independently gated failure modes.

### Production-code licensing

**Production code.** Like Epics 2 and 3, every story runs the full AD-1 three-stage gate: scenario prose → independent human approval → approved red E2E → production. `status: final` on this document records that the *decomposition* is agreed; it authorizes no implementation and grants no AD-1 stage in advance.

### Slice-level preconditions

| Precondition | Severity / status | Effect on Epics 5–8 |
|---|---|---|
| `SEC-AUTH-01` | **P0 open** | `isAllowedForTarget` returns `Boolean(userId)` and the interim session resolver self-provisions a privileged account. **No story in Epics 5–8 may reach production evidence, or be deployed to any shared environment, while this is open.** A new audience or section decision behind a bypassed target check widens the blast radius of the existing bypass rather than being protected by it. *(2026-09-03 correct-course note: implementation evidence exists on the unmerged `dn-um-implementation` branch — see `blockers.yaml` `status_note`. Not yet merged or independently verified; this precondition stays open.)* |
| `UMAC-1` / `UM-E0-S0.1` | **in-progress** | Kernel consumer adoption is incomplete. Epics 5–8 deliver facade decisions; they do not rebind `/users`. Not a deliverable of this pass. |
| `OQ-PERM-01` | P1 open | Default role-to-permission matrix is unapproved. No story seeds, infers, or defaults a functional-role grant. |
| `CC-07` / PM/AD-29 | **P0 open** | No `AccessJournal` table exists. Any story whose behaviour requires a journal entry (Epic 7 shared-link access) may specify the same-transaction contract but cannot produce closure evidence. |
| Whole-row response projection | ratification §4.2 `absent`; PM/AD-34 `partial` | `GET /users` still serializes whole `User` rows. A correct section decision in the kernel does not imply a correct payload at the HTTP edge; Epics 5–8 own the decision, not the projection (SD-7). |

### Post-kernel NFR re-baseline (NFR-AC-1)

`QUALITY-GATE-AC-NFR` was closed on 2026-09-02 against ACM-9 final artifact `acm9-final-acm9-1788173458416-ff94a3e685d1.json`. That closure is pinned to a specific resolver revision — its own closure evidence states that `git diff f89e034..origin/main -- src/access-control/` is empty, so "no resolver change has landed since the measurement."

**Every story in Epics 5, 6, and 8 modifies `services/backend/src/access-control/**` and therefore invalidates that pin.** This is a live regression risk, not bookkeeping: the Epic 5 department walk adds recursive `Department.parentId` traversal and the Epic 6 matrix widens the per-target section join — both are exactly the shapes that consume a 2-second budget.

Binding rule for Epics 5, 6 and 8 (SD-8):

- A story is not `done` until an ACM-9 rerun under protocol `ACM9-MVP-v1` records `status: PASS` at 500 requested active targets with warm p95 **and** worst case ≤ 2 s, against the resolver revision that story produced.
- A rerun that omits the shape the story introduced (nested department depth for Epic 5; multi-section resolution for Epic 6) does not satisfy this.
- A regression reopens `QUALITY-GATE-AC-NFR`. It is not absorbed as transition debt, and ACM-8 composition is not a substitute for ACM-9 measurement.

### Workboard identifier gap

`ACF-*`, `ACM-*`, and `UMAC-*` are stable human-assigned workboard identifiers (PRD §0.2) and are **never** reassigned or extended by a planning pass. Epic 3's own preamble records that its ACM definitions "adopt the human-provided workboard IDs and must not be reassigned."

**Epic 5–8 stories therefore carry no `ACM-*` identifier (SD-2).** They are addressed only as `PLAT-E{epic}-S{story}`, following the `PMC-E*` and `RS-E*` precedent. Assigning workboard IDs to these stories is a human decision and is an open follow-up, not a deliverable.

### Gate registration gap — `AC-SECTION-MATRIX-01` *(closed 2026-09-03)*

**Historical statement, retained for traceability.** As written on 2026-09-02: `AC-S9-S13` in `blockers.yaml` declared `blocks: [Career timeline writes, Mentorship profile projection and closure-note visibility]` — that is **S9 and S13**. Epic 6 spans S2–S16. Sections S2–S8, S14, S15, and S16 had **no** live gate ID, and S12 sat inside the `AC-S9-S13` id range while being absent from both its `blocks:` list and the Gate binding table below.

**Closed 2026-09-03.** `AC-SECTION-MATRIX-01` is registered in `blockers.yaml` — owner Access Control, severity P1, `blocks:` S2–S8 and S14–S16 (naming S6, S8, S14, S15 explicitly), closure condition *an approved AD-1 increment covering S2-S8 and S14-S16, then production evidence*. It is no longer a placeholder and is cited as a live coverage `gates:` ID. The registration prerequisite on Epic 6 entering a sprint is satisfied; the **increment** remains unapproved and the gate remains open. Closing `AC-S9-S13` must not be read as unblocking any section other than S9, S12 and S13.

> Recorded consequence, **resolved 2026-09-03**: `PM-FR-26` cited `AC-S9-S13` as the gate for **S15**, outside that blocker's declared scope. On registration, `PM-FR-26` — together with `PM-FR-21`, `PM-FR-22` (S6) and `PM-FR-35` (S8) — was repointed to `AC-SECTION-MATRIX-01` and its `GATE SCOPE DEFECT` annotation retired.

---

## Epic 1: Platform Spec v1.5 Alignment

**Status:** in-progress  
**Tracker:** `_bmad-output/implementation-artifacts/platform/sprint-status.yaml`

### Story 1.1: Changelog Traceability Matrix

As a planner,
I want every v1.2→v1.5 changelog row traced to artifact status,
So that weekend work knows what is done, gap, or N/A.

**Acceptance Criteria:**

- Matrix includes a row for **`docs/project-requirements.md` as SoT** (not only the changelog).
- Each Breaking + Roles/Departments/Profile/Risks/Resourcing/Sharing/Lifecycle/Integrations/DoD item maps to PRD / SPEC / architecture / test-design status: `done` | `gap` | `N/A`.
- Output lives under `_bmad-output/planning-artifacts/platform/` (or linked from this epic).
- **Ratification reconciliation (2026-09-02):** Matrix includes a row for `architecture-people-management-ratification-2026-09-02/` with companion status (`blockers.yaml`, `evidence-matrix.yaml`, `transition-debt.yaml`).
- Mechanical blocker counts match `blockers.yaml` (not narrative-only; verify open / closed / superseded at execution time).
- Every live `gates:` ID in `global-fr-epic-story-coverage.yaml` resolves to an ID in `blockers.yaml` (e.g. `CC-10-MENTORSHIP`, `OQ-PERM-01`, `TT-IDENTITY-01`, `DEPARTMENT-EDGE` — not superseded historical IDs `TIMETRACKER-CONTRACT`, architecture `OQ-118`, or architecture `CC-11`).
- Every `PLAT-E1-S1.x` story resolves to an entry in `global-fr-epic-story-coverage.yaml`, or is recorded there as decision/gate-serving work with no PM-FR owner (modelling gap called out explicitly).
- Superseded-ID mapping is documented: `TIMETRACKER-CONTRACT` → `TT-IDENTITY-01` + `TT-PMDM-01`; architecture `CC-11` → `ARCH-PROJ-WRITER-01`; architecture `OQ-118` → `ARCH-ENV-01`; `CC-10` → `CC-10-MENTORSHIP` + `ARCH-GOV-01`; historical SCP alias `P-1…P-9` → `PLAT-E1-S1.1…S1.9` / sprint keys `1-1-…`…`1-9-…` (Story 1.9 `done` status predates the corrected AC oracle — record, do not re-key).

### Story 1.2: Platform PRD + Addendum Drift Close

As a product owner,
I want the people-management PRD addendum and memlog aligned to v1.5,
So that DEC/v1.3 “pending” language does not contradict the SoT.

**Acceptance Criteria:**

- Addendum drift register updated (drop obsolete “pending v1.3” framing where v1.5 closed it).
- Pattern E states timetracker **required**, PeopleForce **good-to-have** prefill only.
- Memlog assumptions that still cite v1.2 as authoritative are corrected or struck.

### Story 1.3: Access-Control SPEC + Stage-1 Suite Alignment

As a QA/architect partner,
I want access-control SPEC and scenarios to match v1.5 audiences and rules,
So that stage-2 E2E does not encode a single Manager line or HR Admin full matrix access.

**Acceptance Criteria:**

- Reporting line vs Project line split reflected in CAP intents/success criteria.
- HR Admin = configuration only; full-profile access = separate §2.4 grant mechanism.
- Never-share set `{S3, S7, S13, S14}`; cfg defaults per §4.8.
- Close or rewrite OQ2/OQ3/OQ4/OQ6 where v1.5 answers them; department-manager tier no longer “provisional-only because not in requirements.”
- **PM/AD-24 denial oracle (ratification 2026-09-02):** Live binding docs state 401 invalid/inactive session; 404 missing or hidden-existence target; 403 visible resource forbidden feature/action; lists omit invisible rows; hidden-target 404 precedes mutation permission checks.
- No live empty-audience **403** presented as the current oracle in access-control SPEC, stage-1 scenarios, binding architecture prose, **`user-management/epics.md`**, or UM PRD FR-16/FR-17 text — historical UMAC 403 text may remain with explicit superseded-by-PM/AD-24 annotation (annotate; do not rewrite the 2026-09-01 decision record).
- **Cross-slice editing license:** Platform may annotate UM- and mentorship-owned planning artifacts for PM/AD-24 alignment only; gate-alias changes in `mentorship/epics.md` (draft, unapproved) are out of scope — canonical gate IDs live in `spec-mentorship-domain/SPEC.md` and coverage companions.
- **PM/AD-28 honesty:** No live claim that `matrix/full-profile-access/` scenarios exist; docs state scenarios are not authored and require AD-1 dispatch.
- `spec-mentorship-domain/SPEC.md` and coverage companion gates resolve only to `blockers.yaml` IDs (no live duplicate globals `G-CTX` / `G-PERM` / `G-S13` / `G-CT` / `G-DEP` or `OQ-M1`–`OQ-M7`).

### Story 1.4: Architecture Binding Updates

As an architect,
I want spine AD-10 and `docs/architecture/access-control.md` to describe three manager relations and split lines,
So that implementers do not build one transitive Manager-line graph as the v1.5 model.

**Acceptance Criteria:**

- ARCHITECTURE-SPINE AD-10 and access-control.md document Reporting vs Project line behavior.
- Department management as a manager-access relation is specified (even if implementation phasing is staged).
- Full-profile grant and journal scope are noted; revocation timing (platform next-request vs project 15m / 4h outage) referenced from SoT.
- **PM/AD-7 (H4):** Binding functional-role identity is `Permissions.key` (unique, append-only); `title` is display-only; ACF/AD-4 supersedes earlier `{id, title, description}` catalog shape in live binding docs.
- **ARCH-ENV-01 / PM/AD-34:** Profile assembly + envelope documented; architecture `OQ-118` entries marked `superseded` (not rewritten) with pointer to `ARCH-ENV-01`.
- **ARCH-PROJ-WRITER-01 / PM/AD-31:** Sole writer of project membership documented; architecture `CC-11` entries marked `superseded` with pointer to `ARCH-PROJ-WRITER-01`.
- ACF spine Inherited Invariants include PM/AD-22, PM/AD-23 (exact five-field `applyDepartureEffects` contract), and PM/AD-24; PM and ACF namespaces are not merged.
- `access-control.md` short denial summary links to the complete PM/AD-24 rule (not a partial duplicate).

### Story 1.5: Dashboards + §4.4 v1.5 Fixed Facts

As an architect,
I want `docs/architecture/dashboards.md` “already fixed” section to include v1.5 deltas,
So that engine design (when decided) does not miss Unassigned bucket / risk-active rules.

**Acceptance Criteria:**

- Document Unassigned bucket, risk “active” ≠ `low`, and project-line counter implications as fixed product facts.
- Engine/widget model remains **TBD** — no improvised implementation.

### Story 1.6: Platform Test-Design Refresh (v1.2 → v1.5)

As a TEA owner,
I want platform test-design artifacts updated off PRD v1.2 assumptions,
So that PF vacancies SoT and dual-required integrations are not planned as mandatory.

**Acceptance Criteria:**

- `test-design-architecture-platform`, QA, handoff, and validation cite v1.5 / current SoT.
- PeopleForce = optional prefill; no PF vacancies SoT as required.
- Timetracker is the only required integration; DoD negatives for narrowed project-line noted; PR-B-04 re-gated.
- **QUALITY-GATE-AC (P0):** Platform test-design artifacts cite `gate-decision.json` ACM3-II-06 explicitly; gate closes only when `gate_status=PASS`, `p0_status=MET`, `critical_open=0`, and ACM3-II-06 is covered — current evaluated state (`FAIL` / `NOT_MET` / `critical_open: 1`) is recorded as open debt, not papered over.
- **QUALITY-GATE-AC-NFR:** ACM-9 500-target / 2s performance evidence is tracked separately from the functional P0 gate; baseline and final artifacts are referenced by path.
- Live coverage gates use `TT-IDENTITY-01` and/or `TT-PMDM-01` — not superseded `TIMETRACKER-CONTRACT`.
- **Evidence caveat:** Both TimeTracker gates cite `docs/integrations/timetracker-external-api.json`, which is untracked at the ratification pin — record the caveat verbatim alongside gate IDs; committing the contract is a separate owner decision (`ARCHITECTURE-RATIFICATION.md` §4 evidence baseline).

### Story 1.7: UM Planning Residual (Non–Epic-2–4 Scope)

As a UM planner,
I want SPEC/README CAP-1 retirement confirmed against Story 1.1,
So that test contracts do not still mandate HTTP registration.

**Acceptance Criteria:**

- `spec-user-management-test-cases` CAP-1 retired/superseded in favor of seed scenarios.
- Registration folder disposition matches Story 1.1 (retired pointer).
- Does **not** change UM Epics 0–5 feature scope (CAP-1 / registration retirement only; denial-oracle alignment is Story 1.3).

### Story 1.8: Doc Pass — Create-Path Removal from Binding Docs

As a platform doc owner,
I want binding docs to stop listing `POST /users` create,
So that AD-14 and api-conventions agree with v1.5.

**Acceptance Criteria:**

- **Verify** `docs/architecture/api-conventions.md` states no `POST /users` create route exists (expected phrases: "There is no `POST /users` create route" and "no `POST /users` employee-creation route"); owned sub-collection `POST /users/:id/<collection>` routes are out of scope and must remain.
- `docs/architecture/user-management-test-decisions.md`: confirm `DEC-UM-006`/`DEC-UM-008` remain **RETIRED** and `DEC-UM-003` remains **REFRAMED**; drop stale `um-reg-*` traces; **keep** `DEC-UM-001`, `DEC-UM-002`, `DEC-UM-003`, `DEC-UM-004`, `DEC-UM-005`, `DEC-UM-007`, and **`DEC-UM-009`** (load-bearing for ACM-0 root-row reuse — cited by Platform Story 3.3, UM Story 1.1, and the kernel MVP spec; must not be retired).
- Code removal of `POST /users` remains **implementation handoff** (not this story’s deliverable).
- **Verify** `docs/architecture/database-schema.md` departure transaction (CC-06 / PM/AD-23) contains the phrase **"only open Action Items assigned to the departing person"** (authored-for-other-active-assignee items remain open) — must match `docs/project-requirements.md` CC-06 condition 6.
- No live “open / not yet decided / pending” instructions for designs resolved by PM/AD-32, PM/AD-34, or PM/AD-35 in `database-schema.md`, `api-conventions.md`, or `mentorship.md` (implementation-absent status may remain).

### Story 1.9: Register Epic in Platform Sprint Status

As a delivery lead,
I want platform stories tracked outside user-management sprint keys,
So that Alignment work is visible for the weekend build.

**Acceptance Criteria:**

- `_bmad-output/implementation-artifacts/platform/sprint-status.yaml` lists Epic 1 with canonical sprint keys `1-1-changelog-traceability-matrix` … `1-9-register-epic-in-platform-sprint-status` and global IDs `PLAT-E1-S1.1` … `PLAT-E1-S1.9`. Historical SCP alias `P-1…P-9` (`sprint-change-proposal-2026-08-27.md`) is superseded — do not rewrite the SCP.
- No Platform stories nested under UM `epic-1`…`epic-4` keys.

## Epic 2: Access Control Foundation

**Production code.** Every story runs the full AD-1 three-stage gate (scenario prose → human approval → red E2E → production).  
**Status:** in-progress  
**Tracker:** `_bmad-output/implementation-artifacts/platform/sprint-status.yaml`

Deliver a narrow, reusable audience-resolution boundary without taking ownership of User Management routes, profile projection, or UI. This is a two-day technical foundation; it does not replace the full Access Control facade program or its complete Stage-1 suite.

### Story 2.1: Resolve Phase-0 Audiences (ACF-1)

As a consuming bounded context,
I want a fail-closed Access Control facade that resolves Phase-0 relationship audiences for one or more employee targets,
So that User Management can later replace its interim target-access adapter without re-implementing relationship logic.

**Implementation gate:** The dedicated `spec-access-control-audience-foundation` Stage-1 scenarios must receive independent human AD-1 approval, then be translated to independently approved red E2E before production code begins.

**Acceptance Criteria:**

- `resolveAudiences(viewerId, employeeIds)` returns only Self, Reporting line, direct People Partner, or Colleague for every requested target; Self is exclusive of other audiences.
- Reporting line follows only live `Relationship type='direct'` edges; direct People Partner follows only the target's assigned `people_partner` edge.
- Empty input returns an empty result without database queries; broken or orphaned relationship data reduces access and never grants it.
- No User Management controller, guard, adapter, or frontend file changes are included.
- No Project, Department, PP HR-line, shared-link, full-profile, functional-permission, or section-matrix decision is enabled by this story.

## Epic 3: Access Control Kernel MVP

**Production code.** Every story runs the full AD-1 three-stage gate (scenario prose → human approval → red E2E → production).  
**Status:** in-progress  
**Tracker:** `_bmad-output/implementation-artifacts/platform/sprint-status.yaml`

Deliver a deployable, headless Access Control kernel without changing User
Management or frontend code. The kernel is imported into `AppModule` and proven
through its public facade on real PostgreSQL, but it does not enforce `/users`.
The product gate stays open until a separate User Management-owned integration
story supplies production rebinding, projection, and real-consumer HTTP E2E.

No canonical ACM definitions existed in Git before the approved
`sprint-change-proposal-2026-08-30-access-control-kernel-mvp.md`; the definitions
below adopt the human-provided workboard IDs and must not be reassigned.

### Story 3.1: Inactive Viewer, Bridge, and Target Fail-Closed Behavior (ACM-3)

As a kernel consumer,
I want inactive identities to reduce audience resolution deterministically,
So that deactivation cannot create or preserve an authorization path.

**Dependency:** ACF-1.

**Acceptance Criteria:**

- Preserve a map entry for every distinct requested target; duplicate targets
  collapse to one key, and an empty target list returns an empty map with no
  relationship-graph read.
- Viewer identity validation runs before any audience derivation, Self
  included. Self is exclusive only after both viewer and target are confirmed
  present and active; where the target is the viewer, one confirmation settles
  both.
- An inactive or missing viewer maps every requested target to an empty
  audience `Set` — never Self, never the Colleague floor.
- An inactive or missing target maps to an empty audience `Set` and never falls
  back to Colleague.
- An absent manager edge terminates the chain cleanly. An edge whose endpoint is
  inactive is unusable and is treated as absent for traversal: before viewer
  proof the viewer is unproven and Reporting is denied; after viewer proof the
  chain has terminated without a repeat and Reporting is granted, with nothing
  above the dead node reachable. An edge whose endpoint row is missing is
  unreachable in supported operation — the shape `CHECK` requires a non-null
  endpoint and the foreign key restricts deletion — so it is a defensive rule,
  not a constructible scenario.
- An inactive PP endpoint grants no PP audience and bridges into no other chain.
- Reaching the viewer is provisional. The walk continues to chain termination,
  and Reporting is granted only when that target's whole walked chain terminates
  without repeating a node. A repeated node anywhere in the chain, before or
  after viewer proof, denies Reporting for that target only, so a viewer inside
  a cycle is denied rather than proven.
- For an active viewer and active target, other independently valid audiences
  may still apply; otherwise normal Colleague fallback applies.
- This story ends at the audience-resolution result. It owns no
  `canAccessSection` behavior and no dismissed-target projection.

### Story 3.2: Multi-Audience Merge (ACM-4)

As a kernel consumer,
I want every applicable audience retained for an active viewer and target,
So that a later section evaluator can combine the applicable matrix columns.

**Dependency:** ACF-1.

**Acceptance Criteria:**

- Reporting and direct PP may coexist in one target's audience `Set`.
- Self remains exclusive, and is reached only after both viewer and target are
  confirmed present and active; Colleague appears only when no stronger
  audience applies.
- Duplicate facts do not duplicate results and functional permissions never
  participate in audience merging.
- This story ends at retaining and merging the audience inputs required by
  ACM-5. It owns no `canAccessSection` behavior.
- ACM-4 is validation-only and changes no production code, so it runs under the
  named validation-only evidence exception in `testing-strategy.md`. Any missing
  approved scenario coverage or concrete behavior gap halts Stage 2 onward,
  opens a separately approved AD-1 sequence, and requires a Story Breakdown
  re-run before the package resumes.

### Story 3.3: Deploy-Time Root User Prerequisite (ACM-0)

As a deployer,
I want the normalized root User to exist and be unambiguously identified before
the functional-role bootstrap runs,
So that ACM-1 has a real root identity on a fresh migrated database instead of
an assumed one.

**Dependency:** approved FR architecture. Runs immediately before ACM-1.

**Production entrypoint:** `services/backend/prisma/seed.ts`, invoked by
`npm run db:seed`.

**Acceptance Criteria:**

- Normalize `ROOT_WORK_EMAIL` under DEC-UM-007 — trim outer whitespace and
  lowercase — before validation, write, and lookup.
- Create the root User row with the normalized value stored, so the stored
  `workEmail` is itself canonical, then validate eligibility.
- Count every row whose normalized `workEmail` equals the normalized
  `ROOT_WORK_EMAIL` **first**; a count other than one fails as unmatched or
  ambiguous **before** active state is consulted. Only then is the single row
  checked for `isActive`.
- Unrelated active employees never affect that count.
- A blank, unmatched, ambiguous, or inactive root identity fails with
  actionable diagnostics. A normalized match that is not the intended root is
  never adopted, mutated, or reactivated.
- Concurrent runs converge: the loser of the insert race takes the unique
  violation on `users_workEmail_key`, re-reads, and re-runs the exact-one
  validation. No partial state is left behind.
- Create no permission, FR policy, grant, or attachment, and add no User
  Management API, route, controller, handler, or runtime role management. The
  CRUD prohibition bars that surface, not the single deploy-time root row this
  story exists to write. This story does not implement User Management Story
  1.1's population import. That import is not blocked, but DEC-UM-009 already
  constrains it: no writer may create a second row for a normalized email that
  already exists, so an import covering the root person reuses the root `User`
  id this story created.
- Deliberate behavior change: the current seed warns and skips when
  `ROOT_WORK_EMAIL` is unset. This story replaces that with an actionable
  failure, so a deployment can no longer silently come up with no root
  identity.
- Stage-2 evidence invokes this exact production entrypoint against migrated
  PostgreSQL; re-implementing the logic inline in a test does not satisfy it.

### Story 3.4: Minimal Functional-Role Data Foundation (ACM-1)

As the Access Control kernel,
I want its minimum functional-role permissions and bootstrap attachment stored
as data,
So that feature decisions no longer depend on position strings.

**Dependency:** an independently approved FR architecture amendment resolving
OQ-3, OQ-4, OQ-6, OQ-7, and OQ-11, then a completed ACM-0.

**Production entrypoint:**
`services/backend/src/access-control/infrastructure/bootstrap/access-control-bootstrap.ts`,
wrapped by `services/backend/scripts/bootstrap-access-control.ts` and invoked by
`npm run db:bootstrap:access-control`. Deployment order is `db:deploy` →
`db:seed` (ACM-0) → `db:bootstrap:access-control` (ACM-1) → `start:prod`.

**Acceptance Criteria:**

- Seed exactly `user-management:create`, `user-management:deactivate`, and
  `user-management:list`.
- Seed exactly one `hr-admin` role granting exactly those permissions, and
  exactly one bootstrap attachment.
- Resolve the bootstrap user only through the DEC-UM-007-normalized
  `ROOT_WORK_EMAIL` that ACM-0 established; never use `position === 'HR Admin'`,
  first-user selection, or another fallback.
- An absent, blank, unmatched, ambiguous, inactive, or drifted root identity
  fails the bootstrap clearly and atomically.
- Stage-1 and Stage-2 cover every CAP-3 database invariant: non-null `FR|AR`
  policy type; the FR/AR row-shape `CHECK`; the partial unique FR role key; the
  `Policies(id, type)` support key; unique immutable `Permissions.key`;
  `PolicyPermissions` pair uniqueness; the `policyType='FR'` discriminator and
  its restrictive composite foreign key rejecting an AR grant; the restrictive
  `Permissions` foreign key; the permission-first `(permissionId, policyId)`
  index, asserted against `pg_indexes`; `UserPolicies` integrity including
  rejected bad-user, bad-policy, and duplicate attachments; the
  `AccessControlBootstrap` singleton constraints; and `ON DELETE RESTRICT`
  behavior on all four functional-role-side foreign keys.
- With the `AccessControlBootstrap` singleton absent, ACM-1 adopts an existing
  FR `hr-admin` policy by natural key and an existing attachment only when that
  attachment already belongs to the located root, then writes the singleton;
  attachments belonging to anyone else stay non-bootstrap administrator state
  and are neither adopted nor transferred. With the singleton present, a changed
  normalized root is conflicting drift that fails atomically.
- An AR policy row carrying `targetRole='hr-admin'` is a different object: it is
  never adopted, mutated, counted, or reported as drift, and it is preserved.
- Create no `/roles` or `/users` route and no other role, permission,
  attachment, or default grant.

### Story 3.5: Evaluate `isAllowed` (ACM-2)

As a consuming context,
I want a live functional-permission decision through the Access Control facade,
So that feature checks use persisted FR data without widening profile access.

**Dependency:** ACM-1.

**Acceptance Criteria:**

- `isAllowed(userId, permissionKey)` reads live FR data and contains no branch
  for `hr-admin` or an individual permission name.
- Inactive or missing users, unknown keys, absent grants, and orphaned data
  return `false`.
- Evaluation reads no audience data, persists/caches no decision, and grants no
  profile audience or section access by itself.

### Story 3.6: Base Section Access for S1, S10, and S11 (ACM-5)

As a consuming context,
I want a narrow base section decision over the Phase-0 audiences,
So that future projection can consume a stable decision without being built in
this MVP.

**Dependency:** ACM-4, gated on a recorded ACM-4 disposition of `no-gap`
(`_bmad-output/implementation-artifacts/access-control/acm-4-disposition.yaml`,
field `disposition`).

**Acceptance Criteria:**

- Support only S1, S10, and S11; every other section returns `none`.
- An absent target entry or empty audience `Set` returns `none`.
- S1 is `read` for Self and Colleague, and `write` for Reporting and direct PP.
- S10 and S11 are `read` for every Phase-0 audience.
- Multiple audiences merge `write > read > none`.
- S1 photo mutation and the S10/S11 colleague field subsets remain owning-
  consumer projection/command rules.

### Story 3.7: Compose the Deployable Kernel (ACM-8)

As the backend application,
I want the complete kernel available in the production dependency graph,
So that future consumers can adopt it without rebinding User Management now.

**Dependencies:** ACM-2, ACM-3, and ACM-5, gated on an ACM-9 baseline artifact
whose `status` field is `PASS`.

**Acceptance Criteria:**

- `AppModule` imports `AccessControlModule` and resolves
  `AccessControlFacade`.
- No file under `services/backend/src/user-management/**` changes.
- `ACCESS_CONTROL_PORT` remains bound to `InterimAccessControlAdapter`.
- No `/users` behavior changes and no Access Control HTTP, test-only, or debug
  endpoint is introduced.

### Story 3.8: PostgreSQL 500-Target Performance Evidence (ACM-9)

As a delivery team,
I want measured PostgreSQL evidence for the resolver's 500-target workload,
So that kernel performance risk is visible before and after composition.

**Dependencies:** baseline after ACF-1; final verification after ACM-8.

**Acceptance Criteria:**

- Run the baseline in parallel after ACF-1 without changing behavior under
  `services/backend/src/access-control/**`.
- Record p50, p95, worst case, fixture breadth/depth, query count, PostgreSQL
  version, and `EXPLAIN (ANALYZE, BUFFERS)`.
- Identify the first target-count/depth shape that breaks two seconds.
- Separately determine whether `SET LOCAL statement_timeout = '2s'` becomes the
  earlier failure point.
- Rerun the same evidence after ACM-8. Treat any optimization as a separate
  gated story and do not claim the full `/users` list/projection NFR.

### Kernel Dependency Graph

- ACF-1 → ACM-3
- ACF-1 → ACM-4 → ACM-5
- Approved FR architecture → ACM-0 → ACM-1 → ACM-2
- ACM-2 + ACM-3 + ACM-5 → ACM-8
- ACM-9 baseline runs in parallel after ACF-1; final verification reruns after
  ACM-8.

Two dependencies are conditional and are checked against persisted artifact
state, not free-text ordering:

- ACM-5 requires
  `_bmad-output/implementation-artifacts/access-control/acm-4-disposition.yaml`
  to exist with `disposition: no-gap`.
- ACM-8 and ACM-9-final require the ACM-9 baseline artifact to exist with
  `status: PASS`. A `FAIL` or `INCOMPLETE` baseline halts both and opens
  separately AD-1-gated remediation; a rerun that omits the failing shape does
  not supersede it.

Every new behavior follows AD-1 in separate dispatches: Stage-1 scenario prose,
human approval, Stage-2 approved red kernel integration evidence, then
production. No dispatch may span two stages.

## Epic 4: Access Control Authorization Consolidation

**Production code (kernel + UM adoption).** Crosses the AC/UM boundary
deliberately — unlike Epic 3, which was headless.
**Status:** backlog
**Tracker:** `_bmad-output/implementation-artifacts/platform/sprint-status.yaml`
**Raised by:** `dn-um-implementation` code review, 2026-09-03 (Dmytro Novyk)

`AccessControlFacadeAdapter` hand-writes one authorisation predicate per
section/feature. Almost every target-scoped route asks the same question that
`canAccessSection` already answers. The 2026-09-03 review made the drift
concrete: a `user-management:edit` OR-override was added to `canEditS1` that
contradicts Variant A, the §2.2 dual gate, and the `{ data, canEdit }` roll-out
spec at once. Separately, `canAccessSection` still takes legacy `S1`/`S10`/`S11`
strings — section keys must be human names (`profile:identity`, …).

### Story 4.1: Generalise section-access authorisation + human section keys

As a consuming context and a reviewer of authorisation code,
I want one section-parameterised gate (`@RequireSectionAccess`) driven by
`canAccessSection`, human-named section keys, and a single recorded
functional-permission composition rule,
So that route authorisation is declared once per endpoint, cannot drift between
sections, and reads the same as the §3.2 matrix it enforces.

**Composition decision — RESOLVED** 2026-09-04 (SCP
`sprint-change-proposal-2026-09-04-section-access-consolidation.md` D1/D2):
identity-card edit is a §2.2 dual gate; the feature half is a code constant
`DEFAULT_PERMISSIONS` (per-person section-write keys every active employee
holds), union'd with the explicit FR grant chain in the `isAllowed` evaluator.
No `employee` policy row, no seed/bootstrap change. **Blocked on:** the
architect solution-design pass only — the `@RequireSectionAccess` decorator/guard
shape and the section→endpoint map.

**Full ticket:**
`_bmad-output/implementation-artifacts/platform/story-4-1-generalise-section-access-authorisation.md`

**Acceptance Criteria (summary — see the ticket for the full list):**

- No `S<n>` string is passed as a section identifier anywhere in `src/` or
  `test/`; `canAccessSection` takes the human keys.
- Exactly one place composes the functional half with the section half, matching
  the ratified decision.
- `PATCH /users/:id` and the `GET /users/:id` `canEdit` hint use
  `@RequireSectionAccess('profile:identity', 'write')`; `canEditS1` and the
  `EDIT_USER_FEATURE` / `READ_USER_FEATURE` branches are gone.
- `scripts/dev-grant-root.ts` still gives root `canEdit: true` on every active
  card, with no adapter special case.
- Closes the two access-control deferred-work entries ("Generalise
  section-access authorisation"; the `profile:timeline` rename follow-up).

**Story split:** decided during the architect pass. Do not move 4.1 to
`ready-for-dev` before that design and the composition decision exist. Follows
AD-1 in separate dispatches per stage.

### Story 4.2: Default org-relationship seed + retire the identity-card FR override

As the person running a fresh deployment (and as a developer on a seeded dev DB),
I want the seed to place the root identity at the top of a real reporting tree
and hold the §2.4 full-profile grant,
So that root administers and edits the organisation through the ordinary
audience-resolution path, with no functional-role override anywhere in the
authorisation code.

**Recorded decision (Winston + Dmytro, 2026-09-03/04; ~~the organisation's
boss~~ **CORRECTED 2026-09-08, PO** — see SCP §9.2):** the ACM-0 seeded root
identity holds the `hr-admin` functional role (operator features) **+** the
tree-root position — which is *structural*, the absence of a `Relationship` row,
not a seeded edge (4.2b) **+** the first §2.4 full-profile-access grant (a
**read** overlay). It holds **no profile-section write** by virtue of being root:
`root` is absent from `project-requirements.md`, and §2.2 is NORMATIVE that a
functional role grants no data access. On a clean production install root
resolves `colleague` to everyone and `PATCH /users/:id` is `403` on every target
— the specified behaviour.
A *delegated* HR Admin holds the complete functional-role feature set and may
delegate the role onward, but gets **zero data access** from it — reads/writes a
profile only where they are that person's reporting-line manager or assigned PP
(`access-control.md:19`, `project-requirements.md:100`, NORMATIVE). The
`canEditS1` `user-management:edit` OR-override from the 2026-09-03 review is
deleted — an `isAllowed` that widens the audience is the invariant violation.

**Known boundary (out of scope, no routes today):** the reporting-line audience
is read-only on `profile:personal-contacts`, `profile:emergency-contacts`, and
`profile:documents` (read-write for Self and PP only, by design). Even the
seeded root cannot write those without being the person's PP; §2.4 is read-only
(PM/AD-28). Accept the boundary; revisit if a concrete need appears.

**Full ticket:**
`_bmad-output/implementation-artifacts/platform/story-4-2-default-org-relationship-seed.md`

**Acceptance Criteria (summary):**

- `canEditS1` carries no FR-permission branch; the OR-override pinning test is
  deleted.
- On a seeded dev DB, root resolves `reporting` → `write` on `profile:identity`
  for every active user, `canEdit: true` on every card, no adapter special case.
- A delegated HR Admin (FR only, no relationship): global FR-gated routes
  allowed; `PATCH /users/:id` on an unrelated person → `403`; `canEdit: false`.
- `resolveAudiences` walks upward from targets — a tree-root viewer opening one
  profile queries bounded by chain depth, not org size (ACM-9 measurement
  pattern).
- `db:dev:seed-org` throws under `NODE_ENV=production`, absent from
  `prisma/seed.ts` and `bootstrap-access-control.ts`; ACM-1 invariant suite
  green.

**Depends on:** 4.1's composition decision (land alongside; 4.2 is not
hard-blocked). **Blocked on:** architect solution-design for the upward-walk
resolver change (AC-owned, its own AD-1). Follows AD-1 per stage.

---

## Epic 8: Project-Line Audience

**Status:** backlog
**Binding conditions:** see *Post-Kernel Extension (Epics 5–8) — Binding Conditions*. No story reaches production evidence while `SEC-AUTH-01` is open, and every story carries the ACM-9 re-baseline obligation.

> **Numbering note (renumbered 2026-09-09).** This epic was previously a *second* `Epic 4` in this file, colliding with **Epic 4: Access Control Authorization Consolidation**. It is now **Epic 8**; its four stories moved `PLAT-E4-S4.*` → `PLAT-E8-S8.*` (stories 1–4) and sprint keys `4-n-…` → `8-n-…`. Nothing else changed: scope, acceptance criteria, gates, dependencies and status are as written before. It keeps its authoring position (between Epic 4 and Epic 5) because document order records the post-kernel decomposition order, not the epic number — see the *Numbering* note under **Epic List**. Historical references to `PLAT-E4-S4.*` in specs, story files and test evidence dated before 2026-09-09 denote the **Consolidation** epic and are correct as written.

Derive the **Project line** matrix audience from explicit PM/DM project attachments. Per PM/AD-10 the platform has three manager relations but only two matrix audiences: reports-to and department management feed **Reporting line** (Epic 5); project PM/DM assignment feeds **Project line** and nothing else. The kernel resolves neither.

**FRs covered:** PM-FR-2; PM-FR-1 (the FR-1 consequence that a DM functional role alone grants no tier)

### Blocking gate — read before scheduling

`TT-IDENTITY-01` is **P0 open** and has no approved resolution. Project members arrive from TimeTracker as `AccountTalentDto {email, dateStart, dateEnd}` with no durable id, while the requirements state email alone is insufficient and PM/AD-13 builds `User.ttId` on that premise. **`User.ttId` therefore has no population source today, so no `Relationship type='project'` row can be legitimately created.**

Consequence for this epic, stated so it cannot be misread as progress:

- The stories below specify **resolver behaviour against the graph contract** — which rows and policy attachments produce Project line, and which do not. That is specifiable without the identity join, because the resolver consumes `Relationship type='project'` rows and project policy attachments regardless of who wrote them.
- **No story in this epic may claim that `PM-FR-2` project-line access is delivered.** With no population source, the resolver's correct behaviour on an empty graph is to grant nothing. Green tests on seeded fixtures prove the resolver, not the capability.
- `PM-FR-2` stays `in-progress` in the coverage model when this epic completes. It does not become `implemented`.

Additional gates: `TT-PMDM-01` (P1 open — `projectManager` and `deliveryManager` are untyped strings; joining an authorization edge on an unformatted display name is a fail-open risk) and `ARCH-PROJ-WRITER-01` / PM/AD-31 (P1 open — sync is the sole writer; sync is absent).

**Evidence caveat (inherited from `blockers.yaml`):** all three gates cite `docs/integrations/timetracker-external-api.json`, which is untracked at the ratification pin. Every finding resting on it is a working-tree observation, not a reproducible baseline claim.

### Story 8.1: Project-Line Derivation from Explicit PM/DM Attachments

**ID:** `PLAT-E8-S8.1` · **Sprint key:** `8-1-project-line-derivation-from-explicit-pm-dm-attachments`

As a kernel consumer,
I want Project line granted only to a viewer holding an explicit project-management attachment on a project the target belongs to,
So that ordinary membership and unrelated functional roles cannot manufacture access to a colleague's profile.

**Gates:** `TT-IDENTITY-01` (P0 — no production population source; evidence is resolver proof on seeded fixtures), `SEC-AUTH-01`.
**Dependency:** ACF-1, ACM-3 (viewer/target liveness precedes audience derivation). **SD-8** ACM-9 re-baseline applies.

**Acceptance Criteria:**

**Given** a viewer holding an explicit PM or DM policy attachment on project P and a target with a live `Relationship type='project'` row on P
**When** `resolveAudiences` runs for that target
**Then** the result includes Project line
**And** the decision is not persisted or cached across requests (PM/AD-10)

**Given** a viewer who is an ordinary member of project P with the same target
**When** audiences resolve
**Then** the viewer is Colleague, not Project line (PM/AD-27)
**And** no `targetRole` is introduced for ordinary members
**And** the viewer gains no access to other members' profiles from membership alone

**Given** a viewer who holds the DM or PM **functional** role and has no project attachment
**When** audiences resolve for any target
**Then** no Project line is granted (PM-FR-1)
**And** a DM with no attachment resolves Project line for no target

**Given** a reports-to manager of a DM who holds no project-management relation to project P
**When** audiences resolve for a member of P
**Then** the reports-to manager does not inherit Project line
**And** the chain above a PM extends through **project-management relations only**

**Given** Project-line derivation and Reporting-line traversal
**When** either pass runs
**Then** Project-line derivation does not read, extend, or bridge into the `direct` reports-to graph
**And** reporting-line traversal does not read `type='project'` rows — the two passes share no edge

**Given** an inactive viewer, an inactive target, or an inactive attachment holder
**When** audiences resolve
**Then** no Project line is granted, consistent with ACM-3 fail-closed behaviour
**And** an orphaned or dangling project row reduces access and never grants it

**Given** a bulk request of multiple targets
**When** Project line is derived
**Then** all requested targets resolve in one round trip per graph

**Given** this story's evidence
**When** the suite is green
**Then** the evidence explicitly records that fixtures are seeded, that no production population source exists while `TT-IDENTITY-01` is open, and that green evidence is resolver proof rather than capability proof

### Story 8.2: Project-Line Column Narrowness and Best-Column Merge

**ID:** `PLAT-E8-S8.2` · **Sprint key:** `8-2-project-line-column-narrowness-and-best-column-merge`

As a consuming context,
I want Project line to resolve its own narrower §3.2 column and to combine with Reporting line by strongest-permission,
So that a project manager never reads a subordinate's profile at reporting-line depth.

**Gates:** `TT-IDENTITY-01`, `SEC-AUTH-01`.
**Dependency:** Story 8.1. **Fence:** this story is valuable on the kernel substrate (S1/S10/S11) and does **not** require Epic 6 to function. Sections outside the currently implemented substrate are governed by Epic 6; this story does not widen the supported section set.

**Acceptance Criteria:**

**Given** a viewer who holds Project line and no other relationship-derived audience over a target
**When** `canAccessSection` runs for a kernel-substrate section
**Then** the Project-line matrix column is applied, never the Reporting-line column
**And** the Project-line permission is applied independently of any Reporting-line result

**Given** the same Project-line-only viewer and a section the normative matrix marks `—` for Project line (S2, S3 — asserted when those sections exist; kernel substrate has no such cell)
**When** the section decision is produced
**Then** the decision is `none` / absent — not merely unrendered
**And** a positive-only suite does not satisfy this story

**Given** a viewer who qualifies for both Reporting line and Project line over the same target
**When** effective section access is computed
**Then** the result is the **strongest applicable column permission** (`RW` > `R` > `—`) per PM/AD-10 and CC-02 Option 1

**Given** a section that resolves to `RW` through the merge
**When** the viewer lacks the functional permission required by a dedicated mutation gate
**Then** the command is rejected
**And** the merge never manufactures a functional permission and never bypasses that gate

**Given** a viewer who is also the target and holds a project attachment
**When** audiences resolve
**Then** Self is exclusive and Project line is not applied (PM/AD-28)

**Given** this story's implementation
**When** it is reviewed for section-set widening
**Then** it has not added sections beyond the currently implemented substrate
**And** S2/S3 `—`, S5 CV/certificates-only, and S7 DM/PM asymmetry remain Epic 6 obligations named here as the column-selection contract, not delivered cells

### Story 8.3: Project-Derived Revocation and TimeTracker Outage Withdrawal

**ID:** `PLAT-E8-S8.3` · **Sprint key:** `8-3-project-derived-revocation-and-timetracker-outage-withdrawal`

As a security owner,
I want project-derived access to expire on its own clock and to be withdrawn entirely during a prolonged sync failure,
So that a stale or unavailable integration cannot hold an authorization path open indefinitely.

**Gates:** `TT-IDENTITY-01`, `ARCH-PROJ-WRITER-01` (P1 — production four-hour trigger does not exist while sync is absent), `SEC-AUTH-01`.
**Dependency:** Story 8.1.

**Acceptance Criteria:**

**Given** a live Project-line grant and a project-assignment change
**When** 15 minutes have elapsed (§2.1, §5.1)
**Then** project-derived access has been withdrawn or granted to match the new assignment
**And** platform-owned relations keep their own next-request timing and are unaffected by this clock

**Given** a TimeTracker sync failure
**When** last-known project data is still available
**Then** it may still be served for **display** behind a visible stale-data indicator
**And** display persistence and access persistence are proven as separate decisions

**Given** the same TimeTracker failure lasting **four hours**
**When** audiences resolve after the threshold
**Then** **all** project-derived access is withdrawn
**And** Project line resolves for no target, including targets whose assignments never changed

**Given** an idle system whose last request was before the four-hour threshold
**When** a request arrives after the threshold
**Then** the freshness signal is derived from sync state, not from request time alone
**And** the system does not silently retain Project line past the threshold

**Given** any project-derived decision
**When** a subsequent request arrives
**Then** no prior decision is reused; re-resolution is live per request (PM/AD-10)

**Given** `ARCH-PROJ-WRITER-01` still open
**When** this story produces evidence
**Then** the four-hour withdrawal path is proven against a controlled clock/state fixture
**And** the evidence records that the production trigger does not yet exist

### Story 8.4: Project Membership Is Read-Only to Access Control

**ID:** `PLAT-E8-S8.4` · **Sprint key:** `8-4-project-membership-is-read-only-to-access-control`

As an architect,
I want a proven boundary that no path other than TimeTracker sync writes project membership,
So that two independent writers cannot disagree about who is on a project.

**Gates:** `ARCH-PROJ-WRITER-01`, `SEC-AUTH-01`.
**Dependency:** none within this epic; enforces PM/AD-31. Independent of S8.1–S8.3 (boundary assertion; no resolver-behaviour change).

**Acceptance Criteria:**

**Given** the Access Control module
**When** any code path under `services/backend/src/access-control/**` runs
**Then** no insert, update, or delete of a `Relationship type='project'` row occurs
**And** Access Control consumes those rows read-only

**Given** a test that scans or exercises write entry points in that tree
**When** such a write is introduced
**Then** the test fails — the prohibition is not a review convention alone

**Given** resourcing fulfilment, manual admin, and HR Admin paths
**When** this story is closed
**Then** those paths remain non-writers (`resourcing/epics.md` SD-3)
**And** this story has not implemented or modified the resourcing slice

**Given** `managedBy:'sync'` policy rows
**When** this epic completes
**Then** they remain governed by PM/AD-13 and are not repurposed

**Given** this story `done`
**When** `ARCH-PROJ-WRITER-01` is evaluated
**Then** the blocker remains open — this story does not implement TimeTracker sync
**And** the blocker closes only when sync exists and is proven to be the sole production writer

---

## Epic 5: Department Walk and People Partner HR-Line

**Status:** backlog
**Binding conditions:** see *Post-Kernel Extension (Epics 5–8) — Binding Conditions*. The ACM-9 re-baseline obligation applies with particular force here — this epic introduces recursive traversal.

> **Interim backlog — DEPT-EPIC (`_bmad-output/planning-artifacts/platform/dept-epic.md`, opened 2026-09-07).** Two department-manager items are needed before Epic 5 formally starts, because `profile:timeline` manual write (DEC-UM-001) depends on them and the "Access Control Authorization Consolidation" epic left them out of scope: **DEPT-1** — the `Department.managerUserId` fact + one-level `isDirectDeptManager` derivation; **DEPT-2** — `profile:timeline` `canAccessSection` + dual gate + `hr-admin` stopgap removal. Epic 5's **DEPT-3** (full transitive department reporting-line audience) is the larger deliverable and reconciles the scalar fact with the PM/AD-35 AR-grant model. Track in `dept-epic.md` and `sprint-status.yaml` until pulled into this epic's story list.

Complete the two Reporting-line inputs the kernel left fail-closed. Per PM/AD-10, department management is the second input to the Reporting-line relation (not a third audience), and People Partner propagation runs through the assigned PP's own chain inside HR — never through the employee's delivery chain.

**FRs covered:** PM-FR-2

### Ownership note — this epic cannot close its own gate

`DEPARTMENT-EDGE` (P1 open) closes only when "Department, parentId index, UserDepartment, cycle rejection, and isHr-bounded PP HR-line exist with AD-1 evidence." That closure condition spans **two** contexts:

| Element | Owner | Status |
|---|---|---|
| `Department {parentId, isHr}` table, `parentId` index, `UserDepartment`, cycle rejection on write | **Unassigned** — see below | absent |
| isHr-bounded PP HR-line walk; department-management contribution to Reporting line | `access-control` — **this epic** | absent |

The PM/AD-35 schema has **no owning story in any slice.** The coverage model states this directly under `PM-FR-18`: "no story in any slice creates the PM/AD-35 nested Department schema — ownership must be assigned in user-management or access-control before S2.4 is scheduled."

**Scope decision:** **SD-4** — Epic 5 owns the **walk only**. It does not take PM/AD-35 schema ownership and does not claim `PM-FR-42`, which PRD §4.0 assigns to `user-management` and which `UM-E4-S4.3` already covers.

Two consequences are recorded rather than resolved:

1. **`DEPARTMENT-EDGE` cannot be closed by completing Epic 5.** Every story here can be `done` with the gate still open. Any report that reads Epic 5 completion as gate closure is wrong.
2. **Schema ownership is an open follow-up with a named decision point.** It must be assigned — to `user-management` alongside PM-FR-42, or to a future access-control story — before Epic 5 Stories 5.1 and 5.3 can produce anything but fail-closed evidence. Consumers already waiting: `PMC-E2-S2.4` (PP dashboard department grouping), `RS-E1-S1.1`/`S1.2` (resourcing department routing).

### Story 5.1: Department Management Contributes Reporting Line Over Nested Membership

**ID:** `PLAT-E5-S5.1` · **Sprint key:** `5-1-department-management-contributes-reporting-line-over-nested-membership`

As a kernel consumer,
I want a department manager to resolve Reporting line over everyone in that department and its sub-departments,
So that unit managers see their org unit without a per-employee reports-to edge.

**Gates:** `DEPARTMENT-EDGE` (P1 — schema unowned; this story cannot close the gate, SD-4), `SEC-AUTH-01`.
**Dependency:** ACF-1, ACM-3; PM/AD-35 schema (unowned — see the ownership note). **SD-8** ACM-9 re-baseline applies with nested department depth.

**Acceptance Criteria:**

**Given** a viewer with a `Policies targetType='department'` AR manager attachment on department D
**When** audiences resolve for a current member of D
**Then** the result includes **Reporting line** — the same audience as reports-to, not a new tier and not a Project-line variant (PM/AD-10 relation 1)

**Given** the same attachment on parent department D and nested descendants via `Department.parentId`
**When** audiences resolve for a current `UserDepartment` member of any descendant
**Then** the manager of D resolves Reporting line over that member
**And** the walk is transitive through the parent chain

**Given** a target with zero or multiple current department membership rows
**When** the department-derived audience is evaluated
**Then** the target is treated as unresolvable and yields no department-derived audience

**Given** a viewer reachable by both department management and reports-to over the same target
**When** audiences resolve
**Then** Reporting line is returned once — the two inputs combine without double-counting

**Given** a mentorship pair or a department membership
**When** audience resolution runs
**Then** mentorship pairs never participate (PM/AD-17)
**And** department membership is never stored or read as a `Relationship` type (PM/AD-11)

**Given** a department mutation
**When** the next request arrives
**Then** access is recomputed live with no cross-request tier cache surviving the graph change (PM/AD-10)

**Given** an ACM-9 rerun for this story
**When** evidence is recorded
**Then** the rerun covers nested department depth, not only flat roots
**And** a rerun on the seeded flat-root CSV shape does not satisfy SD-8

### Story 5.2: Fail-Closed Department Walk

**ID:** `PLAT-E5-S5.2` · **Sprint key:** `5-2-fail-closed-department-walk`

As a security owner,
I want every degenerate department shape to reduce access rather than grant it,
So that a partially administered hierarchy cannot become an access-widening bug.

**Gates:** `DEPARTMENT-EDGE`, `SEC-AUTH-01`.
**Dependency:** Story 5.1.

**Acceptance Criteria:**

**Given** the PM/AD-35 schema is absent
**When** `department`-targeted policy rows exist
**Then** they contribute **nothing** and the resolver returns no department-derived audience — fail-closed per PM/AD-12
**And** this is the current expected behaviour and is asserted, not assumed

**Given** a cycle encountered during traversal
**When** the walk runs for an affected target
**Then** the walk terminates and denies the department-derived audience **for that target only**
**And** write-side cycle rejection (PM/AD-35) is not relied upon as the only defence

**Given** an orphaned `parentId`, a membership row pointing at a missing department, or a department with a missing manager attachment
**When** the walk runs
**Then** traversal terminates cleanly and grants nothing

**Given** an inactive manager attachment holder
**When** audiences resolve
**Then** no department-derived audience is granted and the holder bridges into no other chain

**Given** traversal that hits the depth bound
**When** the walk stops
**Then** the result is deny, not a partial grant

**Given** seeded flat-root imports (`parentId` null, `isHr` unset)
**When** audiences resolve
**Then** results are correct and narrow — the seed CSV is flat by design and nesting is platform-administered

**Given** this story
**When** it is implemented
**Then** it creates no `Department` table, no migration, and no department mutation route

### Story 5.3: People Partner HR-Line Bounded by `isHr`

**ID:** `PLAT-E5-S5.3` · **Sprint key:** `5-3-people-partner-hr-line-bounded-by-ishr`

As a kernel consumer,
I want PP access to propagate up the assigned People Partner's own chain only while that chain stays inside HR,
So that a People Partner's non-HR manager does not inherit access to every employee that PP serves.

**Gates:** `DEPARTMENT-EDGE`, `SEC-AUTH-01`.
**Dependency:** ACF-1, Story 5.1 (department membership is the `isHr` source).

**Acceptance Criteria:**

**Given** a target with an assigned `Relationship type='people_partner'` edge
**When** audiences resolve
**Then** the direct PP audience follows that edge, unchanged from ACF-1

**Given** the assigned PP's own `direct` manager chain
**When** HR-line propagation runs
**Then** it walks that chain — never the target employee's delivery chain (PM/AD-10, amended 2026-08-29)

**Given** an ancestor whose current department has `isHr = true`
**When** the next ancestor is evaluated
**Then** propagation continues only while each ancestor's department is HR-marked
**And** the first ancestor whose department is not HR-marked terminates propagation; that ancestor and everyone above resolve no PP audience

**Given** **no** department marked `isHr`
**When** propagation is evaluated
**Then** it is fail-closed to the assigned PP alone (PM/AD-35)
**And** absence of HR marking never propagates to the whole chain

**Given** an ancestor with no department membership
**When** propagation reaches them
**Then** propagation terminates rather than treating them as HR

**Given** an inactive PP endpoint
**When** audiences resolve
**Then** no PP audience is granted and the endpoint bridges into no other chain (ACM-3)

**Given** this story's output
**When** section rights are later projected
**Then** PP-derived section rights remain the separate §3.2 matrix projection (PM/AD-19) — this story resolves the audience only
**And** HR Admin is not a matrix audience and gains nothing here (PRD FR-3, DEC-108)

---

## Epic 6: Section Matrix Beyond the Kernel Slice

**Status:** backlog
**Binding conditions:** see *Post-Kernel Extension (Epics 5–8) — Binding Conditions*.

The facade currently returns `none` for every section other than S1, S10, and S11 (`blockers.yaml` `AC-S9-S13`). This epic extends `canAccessSection` to the full normative §3.2 matrix in `docs/project-requirements.md` §3.2, which is the sole source for every cell.

**FRs covered:** PM-FR-3

### Gate binding

| Sections | Gate | Status |
|---|---|---|
| S9, **S12**, S13 | `AC-S9-S13` | **P1 open** — target matrix approved, increment not approved. S12 added to its `blocks:` on 2026-09-03 |
| S2–S8, S14, S15, S16 | `AC-SECTION-MATRIX-01` | **P1 open** — registered 2026-09-03; target matrix approved, increment not approved |

Closing `AC-S9-S13` unblocks S9, S12 and S13 only. It must not be reported as unblocking any other section.

### Epic-level negative-matrix obligation

PRD FR-3 and FR-4 make `—` a stronger claim than "not rendered": for that audience the section must be **absent from UI, API payload, export, search results, error messages, and notifications**. Every story below carries the same obligation:

- Each `—` cell in the story's section range has an explicit negative assertion per applicable audience. A positive-only test suite does not satisfy a story.
- Absence is asserted at the section-decision boundary this epic owns. **The HTTP payload is not this epic's surface** — `GET /users` still whole-row serializes (PM/AD-34 `partial`), so a correct `none` decision here does not prove the field is absent from the response. Stories record that seam rather than claiming it.
- Record-level flags (S7 *visible for employee* / *visible for PM*, S8 *shared with employee*) and field-level subsets are **owning-consumer projection rules**, not section decisions — the same boundary Epic 3 Story 3.6 drew for S1 photo mutation and the S10/S11 colleague subsets. Stories specify the section decision and name the consumer obligation without absorbing it.

### Story 6.1: S9 Career Timeline Section Decisions

**ID:** `PLAT-E6-S6.1` · **Sprint key:** `6-1-s9-career-timeline-section-decisions`

As a consuming context,
I want S9 resolved for every audience,
So that career-timeline reads and the dual-gated write path have a real section decision instead of a blanket `none`.

**Gates:** `AC-S9-S13` (P1), `SEC-AUTH-01`.
**Dependency:** ACM-5. **Waiting consumers:** `UM-E3-S3.2`, `UM-E3-S3.3` (manual timeline maintenance), `UM-E0-S0.1`. **SD-8** ACM-9 re-baseline applies.

**Acceptance Criteria:**

**Given** each §3.2 audience
**When** `canAccessSection` is asked for S9
**Then** Self resolves `R`; Reporting line, Project line, and PP resolve `RW`; Colleague resolves `—` — matching §3.2 exactly

**Given** a Colleague viewer
**When** the S9 decision is produced
**Then** the Colleague `—` cell carries an explicit negative assertion
**And** Colleague view remains exactly S1, S10 (dates only), and S11 (project name only)

**Given** a viewer who qualifies for more than one relationship-derived audience
**When** S9 is merged
**Then** `write > read > none` applies (Epic 3 Story 3.6 precedent)
**And** Self remains exclusive

**Given** an actor with S9 `RW` who lacks *edit the career timeline*
**When** they attempt to write a timeline event
**Then** the write is rejected (PRD FR-29 dual gate)
**And** S9 `RW` alone is insufficient

**Given** the functional-permission half of that dual gate
**When** it is evaluated
**Then** it remains an `isAllowed` decision (ACM-2) and is not merged into the section decision
**And** section write access never manufactures a functional permission

**Given** a departure event
**When** S9 behaviour is specified
**Then** departure is never a career-timeline event, and no story behaviour here implies one

### Story 6.2: S13 Mentorship Section Decisions and Closure-Note Narrowing

**ID:** `PLAT-E6-S6.2` · **Sprint key:** `6-2-s13-mentorship-section-decisions-and-closure-note-narrowing`

As a consuming context,
I want S13 resolved with its narrower record rules intact,
So that mentorship projection does not fall back to a section-wide grant.

**Gates:** `AC-S9-S13` (P1), `SEC-AUTH-01`.
**Dependency:** ACM-5. **Waiting consumers:** `M-E1-S1.5`, `M-E1-S1.1`–`S1.4`, `PM-FR-32`/`33`/`34`.

**Acceptance Criteria:**

**Given** each §3.2 audience
**When** `canAccessSection` is asked for S13
**Then** Reporting line, Project line, and PP resolve `RW`; Colleague resolves `—`
**And** Self is `RW` on the own open-to-mentoring flag and `R` on pairs — expressed as a section decision plus a named consumer command rule, not collapsed into a single section permission

**Given** the shared-link audience under every link configuration
**When** S13 is requested
**Then** the decision is `—` (never-share set)
**And** no per-link toggle can enable it (Epic 7 Story 7.2 asserts the same invariant from the link side)

**Given** a relationship-derived audience or the full-profile overlay
**When** closure-note visibility is evaluated
**Then** the narrower mentorship rule is not overridden
**And** PM/AD-28's "does not bypass narrower rules such as mentorship closure-note visibility" holds for relationship-derived audiences as well

**Given** a mentorship pair
**When** audience resolution runs
**Then** the pair is never an audience-resolution input (PM/AD-17)
**And** a mentor gains no tier over a mentee from the pair itself

**Given** dismissed people
**When** the willing-mentor pool is considered
**Then** they are excluded from the pool
**And** this story supplies the section decision only and does not implement pool filtering

**Given** `CC-10-MENTORSHIP` P1 open and `src/mentorship` absent
**When** this story produces evidence
**Then** evidence uses seeded fixtures
**And** the story claims the access-control side only, not the consuming context

### Story 6.3: S2–S5 Personal, Emergency, Employment, and Document Sections

**ID:** `PLAT-E6-S6.3` · **Sprint key:** `6-3-s2-s5-personal-emergency-employment-and-document-sections`

As a consuming context,
I want the four sections where Project line is narrowest resolved correctly,
So that a project manager cannot read personal contacts or full document sets.

**Gates:** `AC-SECTION-MATRIX-01` (**P1 open**, registered 2026-09-03 — SD-3), `SEC-AUTH-01`.
**Dependency:** ACM-5.

**Acceptance Criteria:**

**Given** each §3.2 audience
**When** `canAccessSection` is asked for S2
**Then** Self resolves `RW`; Reporting line `R`; **Project line `—`**; PP `RW`; Colleague `—`

**Given** each §3.2 audience
**When** `canAccessSection` is asked for S3
**Then** Self resolves `RW`; Reporting line `R`; **Project line `—`**; PP `RW`; Colleague `—`
**And** S3 is in the **never-share** set — `—` for shared link under every configuration

**Given** each §3.2 audience
**When** `canAccessSection` is asked for S4
**Then** Self resolves `R`; Reporting line, Project line, and PP resolve `RW`; Colleague `—`

**Given** each §3.2 audience
**When** `canAccessSection` is asked for S5
**Then** PP resolves `RW`; Reporting line `R`; Colleague `—`
**And** Self is `R` on own documents with certificate upload as a named consumer command rule
**And** **Project line is `R` restricted to CV and certificates only** — a section decision plus a named consumer projection rule, never full S5 read

**Given** a viewer who holds Project line and no other audience, and a viewer who holds Project line **and** Colleague
**When** S2 and S3 are decided
**Then** both `—` Project-line cells carry explicit negative assertions for both viewers

**Given** a viewer holding both Reporting and Project line
**When** S2 is decided
**Then** the strongest column wins, so S2 becomes `R` through the Reporting column rather than staying `—`
**And** this is the merge rule working as designed and is asserted as such

**Given** S4's `employment status` field
**When** this story runs
**Then** it resolves section access only and does not implement or read the §4.16 departure lifecycle

### Story 6.4: S6–S8 Risks, Management Notes, and Feedback

**ID:** `PLAT-E6-S6.4` · **Sprint key:** `6-4-s6-s8-risks-management-notes-and-feedback`

As a consuming context,
I want the three flag-bearing sections resolved with their asymmetries intact,
So that self-access and record-level visibility are not silently widened.

**Gates:** `AC-SECTION-MATRIX-01` (**P1 open**, registered 2026-09-03 — SD-3), `SEC-AUTH-01`.
**Dependency:** ACM-5.

**Acceptance Criteria:**

**Given** the Self audience
**When** `canAccessSection` is asked for S6
**Then** the decision is `—` — an employee has no access to their own risk section
**And** an explicit negative test exists, because a resolver that defaults Self to read would pass every other S6 case

**Given** other §3.2 audiences
**When** S6 is decided
**Then** Reporting line, Project line, and PP resolve `RW`; Colleague `—`

**Given** S7
**When** audiences resolve
**Then** Reporting line and PP resolve `RW`; Colleague `—`; S7 is in the **never-share** set
**And** Self is `R` restricted to records flagged *visible for employee*

**Given** Project line on S7
**When** the viewer is a DM
**Then** the decision is `RW`
**When** the viewer is a PM
**Then** the decision is `R` and only for records flagged *visible for PM*
**And** the DM/PM distinction is a real section-decision input, not a consumer concern

**Given** S8
**When** audiences resolve
**Then** Reporting line, Project line, and PP resolve `RW`; Colleague `—`
**And** Self is `R` restricted to records flagged *shared with employee*

**Given** record-level flags on S7 and S8
**When** the section decision is returned
**Then** per-record filtering remains the owning-consumer projection rule and is named, not implemented, by this story
**And** a section decision of `RW` never implies every record is visible (PRD FR-4)

### Story 6.5: S12, S14, and S15 — CDS, Action Items, and Request History

**ID:** `PLAT-E6-S6.5` · **Sprint key:** `6-5-s12-s14-and-s15-cds-action-items-and-request-history`

As a consuming context,
I want the three sections whose owning capabilities are unbuilt resolved now,
So that those capabilities inherit a real entitlement decision instead of defining their own.

**Gates:** `AC-S9-S13` (**P1 open**) for the **S12** clause — its `blocks:` list names CDS/S12 as of 2026-09-03; `AC-SECTION-MATRIX-01` (**P1 open**, registered 2026-09-03) for **S14** and **S15**; `SEC-AUTH-01`. **This story spans both gates** — S12 is not an `AC-SECTION-MATRIX-01` section, and closing one gate does not release the whole story.
**Dependency:** ACM-5. **Waiting consumer:** `RS-E2-S2.1` (S15 request history on profile).

**Acceptance Criteria:**

**Given** S12
**When** audiences resolve
**Then** Reporting line, Project line, and PP resolve `RW`; Colleague `—`
**And** Self is `R` with own-IDP completion as a named consumer command rule

**Given** S14
**When** audiences resolve
**Then** Reporting line, Project line, and PP resolve `RW`; Colleague `—`
**And** Self is `R` on own items with mark-complete as a named consumer command rule
**And** S14 is in the **never-share** set — absent from shared-link payload and UI under every configuration

**Given** the Self audience
**When** `canAccessSection` is asked for S15
**Then** the decision is `—` — a person cannot read their own resourcing request history
**And** an explicit negative test exists (same class as S6)

**Given** other audiences on S15
**When** the section is decided
**Then** Reporting line, Project line, and PP resolve `R`; Colleague `—`; shared link `cfg`

**Given** expected compensation
**When** S15 is decided under any audience, including full-profile overlay and shared link
**Then** expected compensation is **never** part of S15 (`resourcing/epics.md` SD-5)
**And** the negative is asserted at the section-decision boundary

**Given** unimplemented owning capabilities (`PM-FR-30`/`31`, `PM-FR-19`, `PM-FR-23`–`26`)
**When** this story produces evidence
**Then** entitlement decisions are proven against seeded fixtures
**And** the story claims no capability coverage

**Given** `PM-FR-26` currently citing `AC-S9-S13` as its S15 gate
**When** this epic is recorded
**Then** the over-stretch is noted: S15 is outside that blocker's declared scope
**And** the correct gate is `AC-SECTION-MATRIX-01`, registered 2026-09-03 and now carried on the `PM-FR-26` row (SD-3)

### Story 6.6: S16 Custom Fields — Specified and Dependency-Blocked

**ID:** `PLAT-E6-S6.6` · **Sprint key:** `6-6-s16-custom-fields-specified-and-dependency-blocked`

As a planner,
I want S16's section decision specified and its blocking dependency stated,
So that the matrix is not silently reported complete while a per-field side channel remains open.

**Gates:** `AC-SECTION-MATRIX-01` (**P1 open**, registered 2026-09-03 — SD-3); PM/AD-32 (design closed, implementation is transition debt).
**Dependency:** ACM-5; `user-management/epics.md` Epic `UM-E7` (2026-09-03 — `PM-FR-5` moved `deferred`→`specified` via `UM-E8`/`UM-E7`, so this story's own blocker is no longer "no owner exists" but "the owning epic hasn't shipped yet"; see the updated Given below).

**Acceptance Criteria:**

**Given** each §3.2 audience
**When** S16 is specified
**Then** Reporting line, Project line, and PP resolve `RW`
**And** Self and Colleague resolve **per-field visibility** — the only matrix cell whose permission is not uniform across the section

**Given** per-field visibility
**When** a runtime store is consulted
**Then** `CustomFieldDefinition.visibility` from PM/AD-32 typed EAV is required
**And** the `User.customFields` jsonb bag (transition debt TD-12) is not queried — it carries no per-field visibility

**Given** `PM-FR-5` is now `specified` (`UM-E8`/`UM-E7`, 2026-09-03) but `UM-E7` has not shipped and `AC-SECTION-MATRIX-01` has not closed
**When** scheduling is considered
**Then** this story is **still not schedulable** — a specified owner is not a shipped dependency, and scheduling S16 ahead of either means inventing a business rule this story exists to avoid

**Given** a filter or sort over a hidden custom-field value
**When** Access Control field visibility is applied
**Then** it is applied **before** filter and sort execution (PM/AD-32)
**And** a hidden value cannot be inferred through a filter side channel (NFR-1 leak path shared with `PMC-E1-S1.8` — the two must not be unblocked independently)

**Given** this story specified
**When** `PM-FR-3` coverage is evaluated
**Then** `PM-FR-3` does not reach `implemented` while S16 is open
**And** the gap is recorded, not an oversight

---

## Epic 7: Shared-Link Section Policy and Full-Profile Overlay

**Status:** backlog
**Binding conditions:** see *Post-Kernel Extension (Epics 5–8) — Binding Conditions*.

Two §3.2 access paths are not relationship-derived audiences: the **Shared link** column, and the **full-profile** overlay that PM/AD-28 defines as sitting outside the matrix entirely. Both are access-control decisions; neither is a lifecycle capability, and this epic owns none of the lifecycle.

**FRs covered:** PM-FR-3 (the Shared-link column and the overlay projection)

### Ownership fence — what this epic does not own

| Concern | Owner | This epic |
|---|---|---|
| §3.2 Shared-link section policy, never-share enforcement, creator-liveness re-check | `access-control` | **owns** |
| AD-28 overlay evaluation and precedence | `access-control` | **owns** |
| Link creation, recipient authentication, expiry clock, revocation UI, link storage | future profile-sharing context | **not owned** |
| Full-profile grant, revoke, first-holder seeding, last-holder block, self-assignment ban | `PM-FR-39` — **deferred** | **not owned** |
| `AccessJournal` writer and `shared_link_access` enrolment | `user-management` (PM/AD-29) | **not owned** — contract specified, `CC-07` P0 open |

`resourcing/epics.md` records the share-link owner as the "future profile-sharing context" and assigns `access-control` only the "share-link section policy." This epic implements exactly that assignment. **`PM-FR-27` remains `uncovered`** — a port is not the capability, and no slice currently owns the link engine that `RS-E1-S1.4` depends on.

### Deferred boundary — `PM-FR-39` full-profile grant lifecycle

`PM-FR-39` is `coverage_status: deferred`. **No story in this epic implements it**, and completing Epic 7 does not change its status.

The boundary is drawn as follows, so that the deferred work has a definite edge rather than an open one:

- **Inside this epic (design-closed, implementable):** overlay *evaluation*. `CC-05` is `closed` at design with PM/AD-28 ratified — Self exclusive when viewer equals target, overlay read-only, `max(Self, overlay)` with write > read > none. Given a grant exists, what it yields is fully specified.
- **Outside this epic (deferred):** how a grant comes to exist or cease. Only a current holder may grant; self-assignment is forbidden; the first holder is seeded at deployment; removing the last holder is blocked; every grant and revocation is journaled. All of it stays `PM-FR-39`, and all of it additionally depends on `CC-07` (P0 open, no journal table).
- **Consequence, stated plainly:** with no grant lifecycle, no full-profile grant can be issued in production. Story 7.3 evidence uses seeded grant rows and proves the evaluation rule, not the capability. Story 7.3 creates no grant route, no revoke route, and no seeding path.

### Story 7.1: Shared-Link Section Policy Port

**ID:** `PLAT-E7-S7.1` · **Sprint key:** `7-1-shared-link-section-policy-port`

As the profile-sharing context,
I want a single access-control decision for which sections a given link may expose,
So that the link engine never computes section entitlement itself.

**Gates:** `CC-07` (P0 — journal enrolment contract specified; **cannot** produce closure evidence), `SEC-AUTH-01`.
**Dependency:** ACM-5; kernel substrate is sufficient for S1-default; Epic 6 for any `cfg` / never-share section beyond S1. **Waiting consumer:** `RS-E1-S1.4`. **SD-5:** this is the port, not PM-FR-27.

**Acceptance Criteria:**

**Given** a link's subject and configuration
**When** the port is called
**Then** it returns the set of sections the named recipient may read
**And** the link engine applies that result and derives no entitlement of its own

**Given** an unconfigured link
**When** the port resolves
**Then** **S1 is on by default** and every `cfg` section is off
**And** the default set is S1 alone

**Given** any section the port yields
**When** permission is inspected
**Then** it is read-only
**And** the shared link never grants write, regardless of the recipient's own relationship-derived audiences or the creator's permissions

**Given** a creator whose qualifying relationship to the subject has ended
**When** the port resolves
**Then** it yields no sections — the link dies immediately rather than at its expiry
**And** creator liveness is evaluated per request and never cached across requests

**Given** an unauthenticated caller, a different authenticated user, or an inactive recipient
**When** the port is called
**Then** it yields nothing
**And** there is no anonymous or anyone-with-link mode

**Given** an inactive subject, an inactive creator, or a missing link configuration
**When** the port resolves
**Then** it yields no sections

**Given** a recipient who independently holds Reporting line over the subject
**When** they open the link versus the normal profile route
**Then** the recipient's own audiences are **not** merged into the link result
**And** the two decisions stay separate — the link neither widens nor narrows the profile-route tier

**Given** an access through a link
**When** the enrolment contract is specified
**Then** every access must be recorded as an `AccessJournal` entry of kind `shared_link_access` in the same transaction (PM/AD-29)
**And** because `CC-07` is P0 open and no journal table exists, this story **cannot** produce closure evidence for enrolment — recorded as an explicit gap

### Story 7.2: Never-Share Set and Per-Link Re-Enablement

**ID:** `PLAT-E7-S7.2` · **Sprint key:** `7-2-never-share-set-and-per-link-re-enablement`

As a security owner,
I want the never-share sections unreachable by any link configuration and the sensitive `cfg` sections re-enabled deliberately every time,
So that a shared link cannot become a standing bypass of the matrix.

**Gates:** `SEC-AUTH-01`.
**Dependency:** Story 7.1.

**Acceptance Criteria:**

**Given** `{S3, S7, S13, S14}`
**When** any link configuration, creator permission, recipient tier, administrative override, or full-profile grant attempts to enable one of them
**Then** the section remains unreachable
**And** a negative assertion exists for each of the four sections independently

**Given** S14 on a shared-link path
**When** the API payload and UI are produced
**Then** S14 is **absent**, not merely marked inaccessible (PRD FR-27)
**And** this absence is a named consumer obligation at the HTTP edge (SD-7) as well as a section-decision `none`

**Given** S2, S5, S6, and S8
**When** a new link is created
**Then** each requires **explicit re-enablement on that link**
**And** enabling one on a previous link never carries forward
**And** no template, copy, or reissue path pre-enables them

**Given** a configuration naming a never-share section
**When** the port receives it
**Then** the configuration is rejected rather than silently ignored
**And** a caller cannot believe it enabled S7

**Given** link expiry (default 24 hours, configurable; resourcing-generated links live until the request is decided)
**When** the engine supplies expired state
**Then** the port does not treat the link as valid
**And** expiry is enforced by the link engine, not by this port — the boundary is recorded

**Given** who may revoke
**When** the authorization rule is specified
**Then** any current Manager or People Partner of the subject can revoke the link and inspect its accesses, with full-profile holders as the backstop so no link is orphaned
**And** revocation is a link-engine capability — this story specifies who may revoke and does not implement the revocation path (SD-5)

**Given** expected compensation
**When** any shared-link configuration is resolved
**Then** expected compensation never appears (`resourcing/epics.md` SD-5)

### Story 7.3: Full-Profile Overlay Evaluation

**ID:** `PLAT-E7-S7.3` · **Sprint key:** `7-3-full-profile-overlay-evaluation`

As a consuming context,
I want the full-profile grant applied as a read-only overlay above Self,
So that a holder reads every section without gaining write authority anywhere.

**Gates:** `SEC-AUTH-01`.
**Dependency:** ACM-5; Epic 6 for overlay evaluation over S2–S16 cells. Implements PM/AD-28; `CC-05` is design-closed. **SD-6:** evaluation only; `PM-FR-39` stays deferred.

**Acceptance Criteria:**

**Given** a full-profile grant
**When** it is evaluated
**Then** it is **not** a §3.2 matrix column and is never mapped onto one
**And** it is evaluated as an overlay after audience resolution

**Given** `viewerId === targetId`
**When** audiences resolve
**Then** Self is calculated **first** and is exclusive, ahead of Reporting, Project, PP, and Colleague
**And** the overlay is then applied on top

**Given** effective section access `max(Self, full-profile)` with `write > read > none`
**When** Self has `—` on S6
**Then** the overlay **supplies read**
**When** Self is read-only on a section
**Then** the overlay **never supplies write**

**Given** functional permissions, command-specific rules, field restrictions, record flags, and mentorship closure-note visibility
**When** the overlay is applied
**Then** none of those five non-bypass classes is bypassed
**And** each class is asserted separately rather than as one blanket test

**Given** a holder of full profile over a target
**When** relationship audiences are inspected
**Then** the holder is **not** granted Reporting, Project, or PP tier
**And** no capability gated on those tiers is granted from the overlay

**Given** HR Admin
**When** this story runs
**Then** HR Admin is not full-profile access and gains nothing (PRD FR-3, DEC-108)
**And** the interim adapter's `position === 'HR Admin'` treatment is transition debt (`OQ-105`) and is not a grant source

**Given** never-share sections and a shared link
**When** a full-profile holder exists
**Then** never-share stays never-share for the link
**And** the overlay governs the holder's own profile reads and does not widen what a link may expose

**Given** this story's evidence
**When** it is produced
**Then** it uses seeded grant rows and proves the evaluation rule, not the capability
**And** no grant route, revoke route, seeding path, last-holder guard, or self-assignment check is created
**And** `PM-FR-39` remains `deferred` when this story completes (SD-6)

---

## Post-Kernel Dependency Graph (Epics 5–8)

- ACF-1, ACM-3 → PLAT-E8-S8.1 → PLAT-E8-S8.2, PLAT-E8-S8.3
- PLAT-E8-S8.4 is independent of S8.1–S8.3 (boundary assertion, no resolver change)
- ACF-1, ACM-3 → PLAT-E5-S5.1 → PLAT-E5-S5.2; PLAT-E5-S5.1 → PLAT-E5-S5.3
- ACM-5 → PLAT-E6-S6.1 … S6.6 (parallel within the epic; each gated separately)
- PLAT-E8-S8.2 does **not** require Epic 6: column-selection and merge are proven on the kernel substrate (S1/S10/S11). Epic 6 delivers the remaining cells that the column-selection contract named.
- ACM-5 → PLAT-E7-S7.1 → PLAT-E7-S7.2 (S1-default port is valuable without Epic 6; `cfg` / never-share cells beyond S1 wait on Epic 6)
- ACM-5, PLAT-E6 → PLAT-E7-S7.3 (overlay evaluation over S2–S16 cells)

Epic independence: Epic 8 functions without Epic 5, 6, or 7. Epic 5 functions without Epic 6, 7, or 8. Epic 6 functions without Epic 5, 7, or 8 (it consumes kernel ACM-5). Epic 7 Story 7.1/7.2 S1-default functions without Epic 6; Story 7.3 overlay over the full matrix waits on Epic 6. File churn on `src/access-control/**` is intentional (SD-9).

External gates, none of which any story here can close:

- `TT-IDENTITY-01` (P0) → all of PLAT-E8 reaching capability coverage
- `DEPARTMENT-EDGE` + unassigned PM/AD-35 schema ownership → PLAT-E5-S5.1, S5.3 reaching capability coverage
- `AC-S9-S13` → PLAT-E6-S6.1, S6.2, and the S12 clause of S6.5
- `AC-SECTION-MATRIX-01` (registered 2026-09-03) → PLAT-E6-S6.3 … S6.6
- `PM-FR-5` (`specified` 2026-09-03 via `user-management` `UM-E8`/`UM-E7`; `UM-E7` unshipped) → PLAT-E6-S6.6
- `CC-07` (P0) → PLAT-E7-S7.1 journal enrolment evidence
- `SEC-AUTH-01` (P0) → production evidence for every story in Epics 5–8
- `UMAC-1` in-progress → consumer adoption; not this pass

## Open Follow-Ups (Epics 5–8) — Not Stories

1. **Assign PM/AD-35 Department schema ownership** to `user-management` or `access-control`. Without it `DEPARTMENT-EDGE` cannot close and `PMC-E2-S2.4`, `RS-E1-S1.1`, `RS-E1-S1.2` stay blocked.
2. ~~**Register `AC-SECTION-MATRIX-01`** in `blockers.yaml`~~ — **DONE 2026-09-03.** Registered with owner Access Control, severity P1, `blocks:` S2–S8 and S14–S16, and an AD-1 closure condition. `PM-FR-26`, `PM-FR-21`, `PM-FR-22` and `PM-FR-35` repointed from the `AC-S9-S13` stand-in; S12 resolved to `AC-S9-S13`.
3. **Assign workboard identifiers** for `PLAT-E5-S5.*` … `PLAT-E8-S8.*`, or ratify that these stories carry none (SD-2).
4. ~~**Create sprint-status keys** for Epics 4–7~~ — **sprint-status half DONE 2026-09-09** (epic-number-collision repair): `epic-5`…`epic-8` and their 16 story keys are now registered in `_bmad-output/implementation-artifacts/platform/sprint-status.yaml` as `backlog`. **Still open:** the `epic-2` / `epic-3` status drift noted in the Overview — not a deliverable of that repair.
5. **Assign an owner for the `PM-FR-27` link engine.** `RS-E1-S1.4` depends on it and Epic 7 supplies only the port (SD-5).
6. **Decide whether `PM-FR-39` is scheduled** or stays deferred past `CC-07` closure. The Epic 7 boundary holds either way (SD-6).

## Step 4 — Final Validation (Epics 5–8, 2026-09-02)

**FR coverage:** PM-FR-1 (one consequence, S8.1), PM-FR-2 (S5.1–S5.3, S8.1–S8.4), PM-FR-3 (S6.1–S6.6, S7.1–S7.3) each appear in at least one story. Referenced FRs PM-FR-4, PM-FR-5, PM-FR-27, PM-FR-39, PM-FR-42 are explicitly not covered. Kernel FRs remain on E2/E3 historical stories (SD-1).

**Architecture:** no starter-template story is required. Tables/entities are created only when a story needs them; Epic 5 creates none (schema unowned, SD-4). E5–E8 are production-code stories under AD-1; `status: final` authorizes the decomposition only.

**Story quality:** 16 stories, each sized for a single dev agent, Given/When/Then AC, ID + sprint key + gates. No forward dependency within an epic. S8.2 is fenced so Epic 8 does not require Epic 6.

**File churn:** Epics 5–8 all modify `services/backend/src/access-control/**`. Split retained per SD-9 (identity / department / matrix / overlay risk boundaries).

**Step 4 FAILs / recorded gaps** (honest; not papered over):

| ID | Severity | Why it is not absorbed |
|---|---|---|
| `SEC-AUTH-01` | P0 open | Precondition. No E5–E8 story may reach production evidence while open. |
| `UMAC-1` | in-progress | Precondition. Consumer adoption is not this pass. |
| `TT-IDENTITY-01` | P0 open | Epic 8 cannot close it. Completing E8 must not promote PM-FR-2 to `implemented`. |
| `DEPARTMENT-EDGE` | P1 open | Epic 5 cannot close it (PM/AD-35 schema unowned, SD-4). |
| `AC-SECTION-MATRIX-01` | **registered 2026-09-03**, P1 open | Live coverage `gates:` ID on PM-FR-3, 21, 22, 26, 35. Increment still unapproved. |
| `PM-FR-5` | deferred *(superseded 2026-09-03 — `specified` via `user-management` `UM-E8`/`UM-E7`, but `UM-E7` unshipped)* | Blocks S16 (S6.6). PM-FR-3 cannot reach `implemented` while S16 is open. |
| `CC-07` | P0 open | S7.1 journal enrolment cannot produce closure evidence. |
| PLAT-E2-S2.1 status conflict | tracking | Coverage `in-progress` vs sprint-status `done`. Left to Platform Story 1.1. |

**Coverage-model actions of this pass:** add the 16 `PLAT-E5`…`PLAT-E8` story IDs under PM-FR-1 / PM-FR-2 / PM-FR-3; do not add `AC-SECTION-MATRIX-01` to `gates:` *(superseded 2026-09-03 — the ID is registered and is now carried on PM-FR-3, 21, 22, 26, 35)*; do not promote PM-FR-2/3 to `implemented`; do not move PM-FR-27 off `uncovered` or PM-FR-39 off `deferred`.
