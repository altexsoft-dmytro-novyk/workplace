---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - docs/project-requirements.md
  - _bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml
  - _bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml
  - _bmad-output/planning-artifacts/ux-designs/ux-people-management-2026-09-02/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-people-management-2026-09-02/EXPERIENCE.md
supersedes:
  - _bmad-output/planning-artifacts/engagement/epics.md#epic-3-risk-records-and-the-scoped-risk-dashboard
status: final
slice: risk
id_namespace: RISK-E{epic}-S{story}
updated: 2026-09-02
---

# People Management — Risk (Records, Trend, Scoped Dashboard) — Epic Breakdown

## Overview

This document is a **bounded-context slice** decomposing exactly **2 canonical PRD requirements**: the risk record with level, history and trend (`PM-FR-21`), and the scoped risk dashboard (`PM-FR-22`).

**Canonical requirement source:** [prd.md](../prds/prd-people-management-2026-08-24/prd.md) **§4.7 Risk Management** (FR-21, FR-22) and [docs/project-requirements.md](../../../docs/project-requirements.md) **§4.6 Risks and Risk Dashboard**, plus §3.2 (S6 row) and §3.3 rules 1 and 2.

> **§-numbering note.** The PRD's own traceability index (§13) rows these two FRs under `§4.6`, matching the requirements document. The PRD *body* section is **§4.7**. Both refs are given throughout this slice; neither is a scope difference.

**User journey anchor:** UJ-4 — a Unit Manager triages unit risks from the risk dashboard and drills into profile S6.

**Architecture authority:** [ARCHITECTURE-RATIFICATION.md](../architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md) — `ratified-with-transition-debt`. Design ratification is **not** implementation evidence. Ratification §4.2 lists "risks" among the surfaces **confirmed absent**.

**Blocker authority:** [blockers.yaml](../architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml).

### Supersession — this slice takes ownership of `PM-FR-21` and `PM-FR-22`

`engagement/epics.md` **Epic 3** (`ENG-E3-S3.1` … `ENG-E3-S3.5`) previously decomposed these same two FRs, and `global-fr-epic-story-coverage.yaml` recorded them against those IDs.

**Product-owner decision, 2026-09-02: risk is carved out of `engagement` into its own slice.** Consequences, all applied as part of this run:

- `risk/epics.md` becomes the **single owner** of `PM-FR-21` and `PM-FR-22`.
- Coverage re-points both FRs from `ENG-E3-S3.*` to `RISK-E*-S*`.
- `engagement` Epic 3 is marked **superseded** and the two FRs are removed from the engagement slice's claim; `engagement` retains `PM-FR-19`, `PM-FR-20`, `PM-FR-35`.
- Nothing in `ENG-E3` is discarded silently — its normative content is re-derived here against the sources, and where this slice diverges from it, the divergence is stated.

**Exit conditions for the carve-out.** A half-applied carve-out is worse than none: it either puts two sets of risk stories on the board or drops risk entirely, each document assuming the other owns it. All four must be true when this run ends:

1. `global-fr-epic-story-coverage.yaml` lists `RISK-E*` in `namespace_rules` and `source_slices`, and `PM-FR-21` / `PM-FR-22` point at `RISK-E*` stories only.
2. `engagement/epics.md` Epic 3 is marked superseded, and `PM-FR-21` / `PM-FR-22` are removed from the engagement slice's FR claim, overview count, and coverage map.
3. No `ENG-E3-S3.*` identifier remains live in any coverage row, and none is ever reused.
4. Any sprint tracking generated from either slice reflects the re-point rather than both sources.

`ACF-*`, `ACM-*`, `UMAC-*` are stable workboard identifiers (PRD §0.2) and are **never** reassigned. No story here claims one.

> **REGISTRATION:** `RISK-E*` is registered in `global-fr-epic-story-coverage.yaml` `namespace_rules` and `source_slices` as part of this run. **PRD §0.2 registration remains open** — §0.2 still enumerates only `PLAT-E*`, `UM-E*`, `M-E*`, `PMC-E*`. Closing it requires a PRD amendment, exactly as `PMC-E*`, `RS-E*`, and `ENG-E*` still do.

### Cross-context boundaries

| Context | Responsibility relative to this slice |
|---|---|
| `risk` (this slice) | The risk record and its append-only history, the level scale, read-time trend derivation, and the scoped risk-dashboard read model. It **consumes and verifies** the S6 section decision — it does not define it |
| `access-control` / `platform` | **Owns the S6 section decision**, delivered by `PLAT-E6-S6.4` ("S6–S8 Risks, Management Notes, and Feedback"). Also per-target audience resolution and the *create and edit risks* / *view a given dashboard* permission keys |
| `user-management` | The profile envelope that hosts S6 (PM/AD-34), and `EmploymentStatus` — which this slice reads from **never** |
| Platform capabilities (`PMC-E*`) | Consumes this slice read-only: the directory risk/trend column (`PMC-E1-S1.1`) and the dashboard risk-count and risk-column widget slots (`PMC-E2-S2.2`) |
| `engagement` (`ENG-E*`) | Action items and campaigns. UJ-4 ends with a manager creating an action item from a risk row — that action item is `ENG-E1`'s, not this slice's |

### Scope decisions (product owner, 2026-09-02)

Eleven decisions. They bind epic and story design and are not re-opened downstream without a new decision.

- **RSD-1 — Carve-out, not a fork.** This slice supersedes `ENG-E3` (above). A reader must never have to decide which of two documents specifies risk behaviour.
- **RSD-2 — `PM-FR-21` has display-only UX and `PM-FR-22` has none; the requirements are the interaction authority.** [EXPERIENCE.md](../ux-designs/ux-people-management-2026-09-02/EXPERIENCE.md) records `PM-FR-21` as "Display only — **no risk management surface**" (a dashboard widget plus an All Employees column) and `PM-FR-22` as "**No surface**"; the sidebar lists **risks** as an item without an artboard. Stories therefore bind to normative behaviour and to **already-named** spine patterns; they invent no new chrome. A future `bmad-ux` run may add layouts without changing any acceptance criterion here.
- **RSD-3 — S6 is owned by `PLAT-E6-S6.4` and gated on `AC-SECTION-MATRIX-01`, registered 2026-09-03. The `AC-S9-S13` stand-in is retired.** The section decision for S6 is delivered by **`PLAT-E6-S6.4` — "S6–S8 Risks, Management Notes, and Feedback"** in `platform/epics.md`; `AC-S9-S13` maps only to `PLAT-E6-S6.1` and `S6.2` (S9 and S13). The coverage model states the consequence directly: *"Closing `AC-S9-S13` unblocks S9 and S13 only and must not be reported as unblocking any other section."* **Disposition, updated 2026-09-03:** `AC-SECTION-MATRIX-01` is now registered in `blockers.yaml` (Access Control, P1) and names **Risk section S6** in its `blocks:` list, so `PM-FR-21` and `PM-FR-22` carry the correct gate directly and the `AC-S9-S13` stand-in — held from 2026-09-02 only because an unregistered ID would break the `PLAT-E1-S1.1` invariant — is retired along with the `GATE SCOPE DEFECT` annotations on both rows. **Closing `AC-S9-S13` still does not unblock this slice.** No story here invents a gate ID.
- **RSD-4 — Risk has no terminal state, and `leaver` is never joined to `dismissed`.** Requirements §4.6: "A risk cannot be closed", and the level moves "from any state to any state, including down to `low`". `leaver` is a prediction about somebody still working; `dismissed` is the fact of departure (requirements §4.16). No API path closes a risk. No query, counter, column, filter, or report joins the risk level to `EmploymentStatus` — because "we had 14 leavers last quarter" has to mean exactly one thing.
  - **Trend materialization — permitted, bounded.** "The trend is never persisted" bans a **drift-capable** field, not caching. A derived cache or materialized projection is allowed if it is invalidated by the risk write path and is **never independently writable** — no route, admin action, migration, or fixture may set a trend that its own history does not produce. What is forbidden is a stored trend that can disagree with the two records it summarises. Stated because Epic 2's N+1 join will create real pressure to persist it, and the rule needs to be available before that pressure arrives rather than settled ad hoc.
- **RSD-5 — The employee never reaches S6 through any surface, and the *existence* of a record is part of what is hidden.** §3.2 marks S6 `—` for Self; requirements §4.6 closes with "Never visible to the employee"; §3.3 rule 1 widens `—` to every surface — UI, API, export, notification, search result, error message. This is enumerated as a negative check over every endpoint that accepts or returns an employee identifier, not asserted once on the profile route. PRD §5.1 already fixes the same rule for the deferred notification path. Four consequences that the sources imply but never state, each carried into Epic 1:
  - **The denial oracle applies to the record, not only to the person.** PM/AD-24 hides *targets* whose existence is secret — but the subject is a **visible** target to themselves. A `403` on a risk resource therefore confirms the record exists. Self and every non-entitled viewer must receive an **identical response whether or not a record exists**. `[DERIVED]` — escalated to `access-control` as a PM/AD-24 extension.
  - **A share link never elevates the subject.** §4.8 sends a link to "an authenticated, explicitly named recipient", and Shared link is a **separate column** from Self in §3.2. Naming the subject as a recipient must not grant them S6: Self is `—` regardless of link configuration. Declared here because `PM-FR-27` is uncovered and the sharing engine must not be built around this gap.
  - **Risk free text is never indexed** into any search surface reachable by a non-entitled viewer. §3.3 rule 1 names search results explicitly, and NFR-2 makes the description field the likeliest carrier of real personal data.
  - **Section presence is data-independent.** A "not returned" state renders identically whether or not a record exists — otherwise the Access preview compliance artifact in EXPERIENCE.md Flow 1 becomes the leak it was built to disprove.
- **RSD-6 — The project line keeps S6, deliberately.** §3.3 rule 2 narrows the project line by removing S2, S3, and most of S5 — and explicitly retains S6, "which a delivery manager genuinely needs". Any implementation that treats "narrowed tier" as "no risk" is a defect, not a safe default.
- **RSD-7 — This slice supplies the risk value; it does not redesign the two surfaces that already display it.** The directory risk/trend column and the dashboard risk widget already have display contracts (`PMC-E1-S1.1`, `PMC-E2-S2.2`, EXPERIENCE.md). This slice is their **source**. Divergence between the value this slice serves and the value those surfaces render is a defect. The risk dashboard itself is a **separate page** (requirements §4.6), not a fifth PM/AD-33 preset and not a widget-engine instance.
- **RSD-8 — The PM/AD-10 traversal gap caps the whole slice, not just the dashboard.** Only reporting-line and direct-People-Partner resolution exists. §3.3 rule 2 deliberately keeps S6 `RW` for the **project line** — but with no project-line traversal a Delivery or Project Manager resolves Manager access over nobody, so today they can neither **read** a risk (Epic 1) nor **record** one (Epic 1) nor **see one on the dashboard** (Epic 2). `PM-FR-21` and `PM-FR-22` are therefore both delivered **capped**. The cap is a coverage fact about the runtime, not a defect in either epic, and it is stated once here rather than implied under one epic.
- **RSD-9 — The *create and edit risks* permission key has no registered blocker guaranteeing it exists, and no story may seed one.** `OQ-PERM-01`'s own note states: "Scope is assignment only. Permission-key existence is a separate gap tracked as `OQ-AC-EDIT`." `OQ-AC-EDIT` blocks exactly two keys — `user-management:edit` and `mentorship:assign` — and neither is a risk key. So this slice gates on a permission whose **assignment** is blocked by `OQ-PERM-01` while its **existence** is blocked by nothing. **Disposition: recorded as an unregistered gate; `access-control` registers an entry before any story here is scheduled.** Explicitly forbidden as a workaround: seeding a risk permission key in bootstrap to unblock development. `OQ-PERM-01` settles this — "Three permissions are seeded in bootstrap; **seeding does not establish a catalog**" — and a seeded key would manufacture the appearance of an approved permission the Product Owner has never granted.
- **RSD-10 — The scope cap belongs to the resolver, not to this slice.** Every criterion here describes today's capped reality, and the cap is stated in RSD-8, in both epics, and in the coverage notes — which makes it easy to mistake documentation of a limit for a specification of one. **The risk read model delegates scope resolution to the audience resolver and never enumerates audience types itself.** No query, read model, or test may encode "reporting line ∪ direct People Partner" as the definition of scope. The cap is asserted **against the resolver's current capability**, so that when PM/AD-10 project-line, department, and PP HR-line traversal lands, the dashboard and the record surfaces widen with it and **no change is required in this slice**. A test suite that encodes the cap as correct behaviour would silently hold the product at Phase-0 after the platform has moved past it — a regression lock that no failing test would ever reveal.
- **RSD-11 — Derived rules are marked, not smuggled.** Where the sources are silent on a case a story must decide (same-date ordering, trend persistence, dashboard-permission key), the story states the chosen rule inline and marks it `[DERIVED]`. Every `[DERIVED]` rule is a Product Owner confirmation item.

### Slice-level preconditions

Not deliverables of any epic here. Both epics consume them, so they are stated once, and no story below may reach production evidence while any of them is open.

| Precondition | Severity / status | Why it precedes both epics |
|---|---|---|
| `SEC-AUTH-01` | **P0 open** | `isAllowedForTarget` **returned** `Boolean(userId)` — every target check passed — and the interim session resolver **self-provisioned** a privileged `position: 'HR Admin'` account. Every risk read and write **would have inherited** both holes. Exposure was latent (backend never deployed), which sequenced the fix, it did not downgrade it. *(Corrected 2026-09-11: the bypass described above no longer exists in code. `interim-session-resolver.adapter.ts` and `interim-access-control.adapter.ts` were deleted in `services/backend` `37a339a` (2026-09-04); `SESSION_RESOLVER_PORT` binds `JwtSessionResolverAdapter` and `ACCESS_CONTROL_PORT` binds `AccessControlFacadeAdapter` (`user-management.module.ts:214-215`), and the `Bearer <token:persona>` shorthand survives only behind `ALLOW_TEST_SESSION_TOKENS`, Joi-gated on `NODE_ENV`. The precondition stays **open pending re-adjudication** — closure needs this project's own verification run, per `blockers.yaml` `status_note` — but it no longer rests on the evidence stated here.)* |
| S6 section decision — **`PLAT-E6-S6.4`** | `specified`, unimplemented | The facade returns `none` for every section but S1/S10/S11. `PLAT-E6-S6.4` is the **owning story** for S6, in `platform/epics.md`. This slice consumes it; **no story here re-implements S6 filtering in the risk context** (RSD-3) |
| `AC-SECTION-MATRIX-01` | **P1 open**, registered 2026-09-03 | The gate for `PLAT-E6-S6.4`, now in `blockers.yaml` naming Risk section S6, and carried directly on the `PM-FR-21` / `PM-FR-22` rows. **Closing `AC-S9-S13` unblocks S9, S12 and S13 only and does not unblock this slice** |
| `OQ-PERM-01` — permission **assignment** | **P1 open** | *create and edit risks* and *view a given dashboard* are both §2.3 granular permissions; the default role→permission matrix is unapproved. **Do not seed or infer grants** |
| Risk permission-key **existence** | **open, unregistered (RSD-9)** | `OQ-PERM-01` is assignment-only by its own note; `OQ-AC-EDIT` blocks only `user-management:edit` and `mentorship:assign`. **No blocker guarantees a risk permission key will exist.** `access-control` must register one |
| PM/AD-10 audience traversal | design `partial` / implementation `partial` | Only Reporting-line and direct-People-Partner Phase-0 resolution exists. Project-line, department, and PP HR-line traversal are absent — this **caps both epics** (RSD-8): project-line managers can neither read nor record a risk, and see nothing on the dashboard |
| PM/AD-34 audience-safe projection | `partial`; ratification §4.2 `absent` | Whole-row `User` serialization can expose non-S1 fields. S6 is assembled through that envelope, and it is the section with the strictest Self rule in the product |
| `CONFLICT-UM-01` | P1 open, implementation stale-and-divergent | PM/AD-24's list-omission and hidden-target-`404` rules bind every risk list and every risk mutation; the runtime still diverges, so denial tests run against the runtime, not only the contract |
| `QUALITY-GATE-AC-NFR` **rerun** | closed, **reopens on contact** | The closure is pinned to resolver revision `f89e034`, and every `PLAT-E6` story modifies `services/backend/src/access-control/**`. This slice's S6 precondition **is** a `PLAT-E6` story, so an **ACM-9 rerun is inherited here as a completion condition, not bookkeeping** — a closed P1 gate reopening through a dependency this slice does not own |
| `PM/AD-25` / `TD-11` | transition debt | The global five-minute frontend `staleTime` can satisfy an NFR-7 immediacy criterion from cache. Every immediacy criterion here names it and requires server-side revalidation |

Owner for the S6 section increment and the permission catalog: `access-control`. Owner for the profile envelope: `user-management`.

> **Mirror, not authority.** This table and the architecture facts below are a **mirror**. `blockers.yaml` and `global-fr-epic-story-coverage.yaml` are authoritative for gate status, and `platform/epics.md` is authoritative for `PLAT-E6`. **No gate closure is ever recorded in this file.** Where this document and a source disagree, the source wins and this document is corrected — never the reverse.
>
> This rule exists because copied invariants are the demonstrated failure mode of this artifact set, not a hypothetical one: `AC-S9-S13` is over-stretched in three separate places, ratification §7's blocker counts contradict §2.1/§10/§11, and `PMC-E*` carries `QUALITY-GATE-AC` as an open P0 that `blockers.yaml` closed on 2026-09-02. Each is a copy that drifted from its source. A tenth slice adds a tenth place to drift, and this rule is the price of the carve-out.

### Recorded inconsistencies in the input set

Findings, not stories. Each was verified against the cited file.

1. **`AC-S9-S13` does not cover S6 — resolved 2026-09-03** (RSD-3). `AC-S9-S13` `blocks:` career-timeline writes, mentorship projection and CDS — S9, S12 and S13. S6 belongs to `PLAT-E6-S6.4`, whose gate `AC-SECTION-MATRIX-01` **is now registered** in `blockers.yaml` and names S6 explicitly. Both requirement rows were repointed and their **GATE SCOPE DEFECT** annotations retired, together with the `PM-FR-26` row for S15 that set the original convention.
2. **`OQ-PERM-01`'s PRD §11 row does not list *create and edit risks*.** It enumerates manage-custom-fields, assign/end-mentorships, approve/reject candidates, edit-career-timeline, and create-feedback. Requirements §2.3 *does* list *create and edit risks* as an independently grantable permission, and the blocker's own scope is "Approved default role-to-permission assignment matrix" — i.e. all of them. The gate applies; the PRD row is under-enumerated.
3. **PRD §13 rows these FRs under `§4.6`; the PRD body section is `§4.7`.** Recorded above; not a scope difference.
4. **`PM-FR-11` (XLSX export) and `PM-FR-8` (directory columns) reach risk through `PMC-E1`, not through this slice.** No story here re-projects a risk value into the directory or an export.
5. **Neither `OQ-PERM-01` nor `OQ-AC-EDIT` covers the existence of a risk permission key** (RSD-9). `OQ-PERM-01` is assignment-only by its own note; `OQ-AC-EDIT` `blocks:` exactly `user-management:edit` and `mentorship:assign`. The gap is real and unregistered.
6. **The *view a given dashboard* permission and RSD-7 pull against each other.** Requirements §2.3 makes *view a given dashboard* a per-dashboard grant, while requirements §4.6 and PM/AD-33 make the risk dashboard a **separate page** that is explicitly not one of the four presets. Which key governs a page that is deliberately not a dashboard is unanswered by the sources — an Epic 2 `[DERIVED]` decision and an `access-control` confirmation item, not something a story may settle silently.
7. **`PLAT-E6-S6.4` has three consumer slices and no owning consumer contract.** That one story delivers S6, S7, and S8 together, and its consumers are now `risk` (S6), `feedback` (S8), and `engagement` (S14, via `PLAT-E6-S6.5`). No document owns how the increment is consumed, so three slices can drift independently against one dependency. **This gap was created by the risk and feedback carve-outs** — when it was a single engagement slice, one document held the consumer view. Recorded for escalation to `access-control`; not resolvable inside this slice.
8. **UJ-4 has no UX-validated end-to-end journey.** None of EXPERIENCE.md's three Key Flows lands on a risk-management surface, though Flow 3 exercises the directory risk column. The strongest argument for a `bmad-ux` run before implementation rather than after.

## Requirements Inventory

### Functional Requirements

Exactly 2, verbatim-sourced from PRD §4.7 (indexed §4.6) and requirements §4.6.

- **PM-FR-21** *[PRD §4.7 FR-21 · requirements §4.6]*: Risk levels have the fixed ascending order `low` < `need attention` < `medium` < `high` < `leaver`. History is retained and current = latest. A risk has **no** close or resolved state; it can move between any levels, including down to `low`. A trend arrow appears **only** when the level differs from the previous record. `leaver` is a prediction and must never be conflated with `dismissed` employment status.
  - Consequence *(requirements §4.6)*: a risk record carries a **level, a description of the situation, details, and a date**; the current level is the most recent record.
  - Consequence *(requirements §4.6)*: **"active" means any level above `low`** — a person sitting at `low` is counted in no active-risk counter on any dashboard.
  - Consequence *(requirements §4.6)*: **no arrow** when the level is unchanged **or** when this is the first record.
  - Consequence *(requirements §3.2 S6, §3.3 rules 1–2)*: S6 is `—` for Self and Colleague, `RW` for Reporting line, **`RW` for Project line**, `RW` for PP, and `cfg` on a shared link.
- **PM-FR-22** *[PRD §4.7 FR-22 · requirements §4.6]*: Counts include only **active** risks (levels above `low`, with `medium`/`high`/`leaver` emphasised); a sortable and filterable table; drill-through to profile S6; scoped to the people over whom the viewer holds **Manager or People Partner** access.
  - Consequence *(requirements §4.6)*: the Risk Dashboard is a **separate page**.
  - Consequence *(requirements §4.6)*: the table lists all people with risks, **sorted by severity descending, then by date**, showing the trend arrow.
  - Consequence *(requirements §4.6)*: **filterable by department, project, PP, manager**.
  - Consequence *(requirements §4.6)*: drill-through **from a count to the filtered table**, and **from a row to the profile**.
  - Consequence *(requirements §4.6)*: never visible to the employee.

### NonFunctional Requirements

From PRD §8, filtered to what binds this slice.

- **NFR-1** *[PRD §8]*: Access-control correctness is the primary quality attribute; a leak is a **critical defect**. S6 is the section with the strictest Self rule in the product — `—` for the person it describes — so this slice is where NFR-1 is most load-bearing.
- **NFR-2** *[PRD §8]*: Seeded test population only; no real PII in fixtures, logs, screenshots, or agent contexts. Risk **descriptions and details are free text** and are the single most likely place in this slice for real personal data to enter a fixture — fixtures are synthetic by construction.
- **NFR-5** *[PRD §8]*: Responsive layout and accessibility for list, profile, and **dashboard** pages — the risk dashboard is squarely in scope.
- **NFR-6** *[PRD §8]*: English UI only (DEC-104).
- **NFR-7** *[PRD §8]*: Functional-permission revocation is **immediate**; platform-owned relationship changes apply on the **next request**; project-derived access changes within **15 minutes** and is withdrawn after four hours of failed sync. Binds three separate criteria here: losing *create and edit risks*, losing *view a given dashboard*, and a manager/PP/department change that removes a person from the viewer's risk-dashboard scope.

**Not applicable, recorded rather than assumed:** **NFR-3** (≤2s at 500+ rows) is scoped by PRD §8 and SM-4 to the **All Employees list**. The risk dashboard performs a comparable Manager/PP scope walk but is not a stated NFR-3 surface. Epic 2 **measures and records** its scope-resolution cost rather than claiming or inheriting the NFR-3 threshold. **NFR-4** (external integration degradation) is not engaged — risk data has no external source.

### Additional Requirements

**Architecture (binding)**

- **PM/AD-5 — Bounded-context map** *(ratified; implementation partial)*: `user-management`, `access-control`, and storage exist; `mentorship` and `action-items` are confirmed and unimplemented. **Risk has no context of its own in the map.** Its placement — a `risk` context, or a module inside `engagement` — must be confirmed against PM/AD-5 before Epic 1 enters a sprint, and this slice does not silently create a new top-level context by fiat.
- **PM/AD-10 — Live audience and section resolution** *(design partial; implementation partial)*: Reporting-line and direct-PP Phase-0 only. Project-line, department, and PP HR-line traversal are **absent** — the hard cap on `PM-FR-22` scope and on §3.3 rule 2's project-line S6 entitlement.
- **PM/AD-24 — HTTP denial oracle:** `401` invalid or inactive session; `404` missing **or hidden-existence** target; `403` visible resource with a forbidden feature or action. **List endpoints omit invisible rows.** Hidden-target `404` precedes mutation permission checks.
- **PM/AD-25 — Frontend authorization and cache contract** *(transition debt TD-11)*: the global five-minute `staleTime` conflicts with NFR-7 immediacy and is named in every immediacy criterion here.
- **PM/AD-29 — `AccessJournal`** *(design ratified; no table — `CC-07` P0 open)*: the journal records only access-changing events. **Recording a risk is not a journal event** — it changes no one's entitlement. Stated so the journal is not widened into a general audit log.
- **PM/AD-30 — `UserEvents`** *(design ratified; no model — `CC-09` P0 open)*: **no risk event is a career-timeline event.** Requirements §4.9 fixes the tracked list and it contains no risk event.
- **PM/AD-33 — Fixed dashboard read models** *(ratified; implementation absent)*: four fixed read models, **explicitly no generic widget engine**. The risk dashboard is a separate page, not a fifth preset (RSD-7).
- **PM/AD-34 / ARCH-ENV-01 — Profile assembly + envelope** *(ratified; implementation partial)*: S6 is assembled into the `user-management`-owned envelope with `canEdit` computed by `access-control`.
- **Ratification §4.2** — risks are among the surfaces **confirmed absent**. There is no existing risk implementation to extend, and no story here may claim brownfield credit.

**Fixed product facts (not re-decided here)**

- Risk "active" means any level above `low`; a person at `low` is counted in no active-risk counter — already ratified as a fixed dashboard fact in `platform/epics.md` Story 1.5 and carried by `PMC-E2`.
- S6 is `cfg` on a shared link: **off by default *and* requiring explicit re-enabling on every link** — two separate properties, both apply (requirements §4.8).
- The four relationship fields (manager, people partner, department, department's manager) are access switches governed by *change organisational relationships*; this slice never writes them and never infers scope from anything else.
- Functional roles never widen data access (requirements §2.3). Holding *create and edit risks* grants no visibility of anybody.

### UX Design Requirements

**Partial by design (RSD-2).** `PM-FR-21` is "Display only — no risk management surface"; `PM-FR-22` is "No surface"; **risks** is a sidebar item without an artboard. What binds is the spine's cross-surface contract — referenced by token name, values in [DESIGN.md](../ux-designs/ux-people-management-2026-09-02/DESIGN.md).

- **RISK-DR1**: Both surfaces are reached from the **existing** sidebar `risks` target under Workspace; navigation is not restructured. The risk dashboard is a **separate page**, not a dashboard preset tab.
- **RISK-DR2**: Every new page carries the page header band `.pghd`: mono eyebrow in `{typography.page-eyebrow}` formatted `AREA / SCREEN`, title in `{typography.page-title}`, one-line lead in `{typography.page-lead}` (max-width ~720px), and a `{spacing.pghd-accent-width}` accent tick. Accent is `{colors.stretch-blue}` — **`{colors.stretch-amber}` and `{colors.stretch-violet}` carry reserved meanings** (timetracker sync, access inspection) and must not be used decoratively here.
- **RISK-DR3**: A `.prov` provenance tag in the **`ACCESS`** variant is visible in the header of every risk surface, because every one of them resolves per request. It carries a text label, is never colour-only, and is never tooltip-only.
- **RISK-DR4**: Every counter and aggregate carries a `.wscope` scope footer stating in mono uppercase which access policy was evaluated. **A counter never widens viewer entitlement.**
- **RISK-DR5**: Stat values render in `{typography.data-stat}` (Geist Mono).
- **RISK-DR6**: Empty conditions use the empty state `.emptyst`: icon, bold line, direction, action. An **empty scope** and a **measured zero** are visually distinct states, never the same rendering.
- **RISK-DR7**: Loading uses a shadcn `Skeleton` matching the target counter/table layout, not a spinner or blank region.
- **RISK-DR8**: **WCAG 2.2 AA.** Focus rings `{colors.ring}`; tab order follows visual layout; segment and tab controls arrow-key navigable; `prefers-reduced-motion: reduce` disables all 140ms transitions. **The trend arrow conveys direction by more than colour alone**, and severity emphasis is never colour-only.
- **RISK-DR9**: Responsive per the spine — `≥lg` full sidebar and multi-column grid; `md` sidebar collapsed to icons and a 2-column grid; `<md` sidebar becomes a `Sheet` and the risk table scrolls horizontally.
- **RISK-DR10**: Microcopy is **direct, honest, permission-literate** — it states what the API returned and which policy was evaluated. Motivational HR phrasing is forbidden; gaps are stated, never hidden. This is sharpest on a risk surface, where a soft euphemism for `leaver` would defeat the requirement that the word mean one thing.
- **RISK-DR11**: **Banned, and testable as negatives**: client-side section hiding as a substitute for server omission; a functional role used to widen data access; inferring hidden values through filter side channels. The risk-dashboard filters and their option lists are the live side-channel candidate in this slice.
- **RISK-DR12** *(derived — records an existing contract, does not create one)*: the directory risk/trend column (`PMC-E1-S1.1`, Flow 3) and the dashboard risk-count and risk-column slots (`PMC-E2-S2.2`) **already have** display contracts. This slice supplies their source; **no story here redesigns them**, and divergence is a defect (RSD-7).
- **RISK-DR13** *(derived)*: `PMC-E2-S2.2` requires each dashboard slot's availability to key on its **source FR's state**. Completing Epic 1 flips exactly the `PM-FR-21` slots — the risk counts and the risk/trend column — and must require no change to any other slot's declaration.
- **RISK-DR14** *(derived)*: the Colleague-view banner already states that **risk is never sent** (`PMC-E1`, EXPERIENCE.md). This slice must keep that statement true at the API, not merely at the toggle.

### FR Coverage Map

| Requirement | Epic | Delivered outcome |
|---|---|---|
| `PM-FR-21` — Risk record, level, history, trend | **Epic 1** — `RISK-E1-S1.1`, `S1.2`, `S1.3`, `S1.4` | A manager or People Partner records where somebody sits on the attrition scale, sees movement since the last record, and the employee never learns any of it exists. Delivered **capped** (RSD-8) |
| `PM-FR-22` — Scoped risk dashboard | **Epic 2** — `RISK-E2-S2.1`, `S2.2`, **`S2.3` (gated)** | One page triaging everybody at risk in the viewer's scope, worst first, with drill-through into the record. Delivered **capped** (RSD-8); filters gated on `DEPARTMENT-EDGE` / `TT-IDENTITY-01` |
| NFR-1 | Epics 1, 2 | Per-audience negative checks over every S6-bearing payload; enumerated endpoints, not a single profile assertion |
| NFR-2 | Epics 1, 2 | Synthetic fixtures by construction — risk description and details are free text |
| NFR-5, NFR-6 | Epics 1, 2 | RISK-DR2, RISK-DR6–RISK-DR10; page-level chrome, responsive and accessibility criteria land on `RISK-E2-S2.1`, the only new page this slice introduces |
| NFR-7 | Epics 1, 2 | Losing *create and edit risks*; losing *view a given dashboard*; a relationship change removing a person from dashboard scope — each revalidated server-side against TD-11 |
| **NFR-3** | — | **Not claimed.** Scoped by PRD §8/SM-4 to All Employees; Epic 2 measures and records its own scope-resolution cost instead |
| **NFR-4** | — | **Not engaged.** Risk data has no external source |
| **Slice-level preconditions (no epic)** | — | `SEC-AUTH-01`; S6 facade support (`AC-SECTION-MATRIX-01`, RSD-3); `OQ-PERM-01`; risk permission-key existence (unregistered, RSD-9); PM/AD-10 traversal cap (RSD-8); PM/AD-34 projection; `CONFLICT-UM-01`; TD-11 |
| **Not covered in this slice** | — | The directory risk column and dashboard risk widgets that *consume* this source (`PMC-E1-S1.1`, `PMC-E2-S2.2`); the action item a manager creates from a risk row (`ENG-E1`); profile sharing of S6 (`PM-FR-27` — this slice declares the section policy, it does not build the link engine); risk analytics (requirements §4.14, GOOD TO HAVE) |

## Epic List

Two epics, one per FR. They were tested against consolidation and kept separate — see the note below.

### Epic 1: The Risk Record — Level, History, Trend, and the S6 Wall

A manager or People Partner records an employee's attrition risk with a level, a description of the situation, details and a date; every earlier record is retained; the current level is the latest one; movement since the previous record is shown as a trend; and the person the record describes cannot reach it through any surface the platform exposes.

**FRs covered:** `PM-FR-21`
**NFRs engaged:** NFR-1, NFR-2, NFR-5, NFR-6, NFR-7
**UX-DRs covered:** RISK-DR1–RISK-DR8, RISK-DR10–RISK-DR12, RISK-DR14

**Audience:** managers on the reporting line, **managers on the project line** (§3.3 rule 2 keeps S6 for them, deliberately), People Partners, and holders of *create and edit risks*. The employee is an audience only in the negative — this epic is where "never" is enforced.

**Standalone:** yes **within this slice** — it needs no dashboard, no filter engine, and no other epic here. It is **not** standalone in the product: rendering a risk on profile S6 requires the `PM-FR-12` section-based profile host, which is `in-progress` (`UM-E0-S0.1`, `UM-E1-S1.2`), plus the S6 increment the facade does not have. The epic's write path and history stand alone; its visibility depends on `user-management`.

**Capped delivery (RSD-8):** project-line Delivery and Project Managers are entitled to S6 `RW` by §3.3 rule 2 but resolve Manager access over nobody today, so they can neither read nor record a risk until PM/AD-10 traversal lands. `PM-FR-21` is delivered capped, and this epic does not claim otherwise.

**Enables (without depending on):** `PMC-E1-S1.1`'s directory risk and trend column; `PMC-E2-S2.2`'s risk-count and risk/trend widget slots on the UM and PP dashboards — both currently render as *unavailable* with `PM-FR-21` as the named missing source; and Epic 2, which is a read model over this data.

**Risk boundary:** confidentiality. S6 is `—` for the person it describes, and §3.3 rule 1 extends that to the API, exports, search results, notifications and error messages. This is the epic where a leak is a critical defect (NFR-1), and its stories are ordered so that **risk records cannot exist before the projection that hides them is enforced**.

**The `PLAT-E6-S6.4` dependency is not uniform.** It binds the **read surfaces and the S6 verification** — the write path, the append-only history, and trend derivation need no S6 section decision to be built. Specification and the write path therefore need not idle behind `platform`. The release unit is unchanged: for **production evidence**, records and the wall ship together, and risk records must not exist in a live environment before the projection that hides them is enforced.

**Boundary with `PLAT-E6-S6.4` — one wall, not two.** The S6 section decision is owned by `access-control` and delivered by `PLAT-E6-S6.4`. This epic's S6 story **verifies** that decision end-to-end across every endpoint that names an employee; it does **not** define the audience rule, and it does **not** add a second filtering layer inside the risk context. Two implementations of one rule is how the Self-view leak gets built: each side assumes the other holds the wall, and the gap between them is the defect. Where verification finds the facade's decision insufficient, that is a `PLAT-E6-S6.4` bug reported against `access-control`, never patched locally here.

**Evidence is an inventory with a standing obligation, not a passing sweep.** "Enumerate every endpoint that names an employee" is true on the day it runs and stale on the next merge. The S6 verification story therefore produces a **versioned endpoint inventory** as its artifact, and carries a standing rule: **any new endpoint that accepts or returns an employee identifier extends the S6 negative matrix**. Without that, the next endpoint added lands outside a check that already passed green.

**Consumer obligation carried to `PMC` (extends RISK-DR12).** The directory XLSX export (`PM-FR-11`) and the directory filters (`PM-FR-8`) must exclude risk for the **viewer's own row**, not only for colleague rows. Every negative matrix written so far is phrased about colleague-tier viewers; the subject exporting or filtering a list that contains themselves is the case that falls between the two slices. This slice cannot fix it — `PMC-E1` owns both surfaces — so it is named here as an obligation on the consumer rather than assumed to be covered.

**Implementation notes:** risk placement in the PM/AD-5 context map must be confirmed before sprint entry — the map has no `risk` context today. History is append-only; the trend is derived at read time and never persisted as an independently mutable field. No route, field, or state transition closes a risk (RSD-4).

### Epic 2: The Scoped Risk Dashboard

A manager or People Partner opens one page and sees everybody at risk across their whole scope — counts by level with the serious ones emphasised, a table sorted worst-first with trend, filters to narrow it, and drill-through into the record — without that page ever showing them one person more than they were already entitled to see.

**FRs covered:** `PM-FR-22`
**NFRs engaged:** NFR-1, NFR-2, NFR-5, NFR-6, NFR-7
**UX-DRs covered:** RISK-DR1–RISK-DR13

**Audience:** viewers holding *view a given dashboard* **and** Manager or People Partner access over at least one person. Today that means reporting-line managers and direct People Partners only.

**Standalone:** yes as a page, but it is **empty without Epic 1** — it is a read model over Epic 1's records. It depends on Epic 1 and nothing else in this slice.

**Depends on:** Epic 1.

**Scheduling consequence — this is what the split buys.** This epic can be **deferred wholesale, or shipped without its filter story, without touching Epic 1**. That independence is the point of keeping the two apart: merging them would bind the risk record — which unblocks four consumer slots across `PMC-E1` and `PMC-E2` — to `DEPARTMENT-EDGE` and `TT-IDENTITY-01`, neither of which has a table or an owning story in any slice. This epic is thin because of its gates, not because its scope was drawn too narrow.

**Risk boundary:** scope resolution and side channels — a different failure mode from Epic 1's. Epic 1 asks *may this viewer see this person's risk*. Epic 2 asks *which people does this viewer's scope contain*, and answers it 500 times per page load. Its filters, its filter **option lists**, and its counters are each a candidate channel for inferring the existence, department, project, manager or risk level of somebody outside that scope (RISK-DR11).

**Scope cap (RSD-8):** `PM-FR-22` says "Manager or People Partner access", and PM/AD-10 resolves only reporting-line and direct-PP audiences. **A Delivery Manager or Project Manager sees nothing through this dashboard until that traversal lands**, even though §3.3 rule 2 entitles them to S6. The FR is delivered *capped* — a coverage fact about the runtime, not a defect in this epic.

**`leaver` never meets `dismissed` here (RSD-4), and this is the epic where it will be broken.** Epic 1 forbids the join at the record; the pressure to create it lands on **this** page, as an entirely reasonable-sounding request — "don't list people who already left in the risk table". No counter, filter, sort, option list, drill-through, or export on this dashboard reads, writes, joins, or excludes on `EmploymentStatus`. A departed person's risk history is governed by retention (PRD §10, unresolved), not by a silent filter that redefines what `leaver` counts.

**Completion reporting is capped, and the cap propagates.** `PM-FR-22` may not be promoted beyond *capped* while PM/AD-10 traversal is absent. Downstream, a consuming `PMC` slot must **not** flip from *unavailable* to a measured zero for a viewer whose audience cannot resolve — a DM reading `0` as "nobody on my projects is at risk" is a worse outcome than the slot staying visibly unavailable (RISK-DR6, RISK-DR13).

**Permission-key question, open (inconsistency 6):** this epic gates on *view a given dashboard*, a per-dashboard grant — while RSD-7 makes this page deliberately **not** one of the four PM/AD-33 presets. Which key governs it is a `[DERIVED]` decision for the dashboard story plus an `access-control` confirmation; a story may not settle it silently.

**Implementation notes:** a separate page, not a fifth PM/AD-33 preset and not a widget-engine instance (RSD-7). Counts include only active risks — above `low` — with `medium`/`high`/`leaver` emphasised. Filters by department and project are hard-gated on `DEPARTMENT-EDGE` (no table exists) and `TT-IDENTITY-01`/`TT-PMDM-01`, and are isolated into their own story so the rest of the epic can ship. **The trend is derived at read time from each person's two most recent records (Epic 1), which is an N+1 shape across a 500-row scope** — the measurement story covers the trend join explicitly, not only the scope walk.

---

**Why not one epic.** Both epics touch the risk model, which invites consolidation under the file-churn rule. They are kept separate because the overlap is incidental rather than end-to-end: Epic 1 owns the write path, the history, and the section projection; Epic 2 adds a page and a scope-resolving read model over data it never writes. More decisively, they fail differently — Epic 1's failure mode is *the subject reads their own risk*, Epic 2's is *a viewer infers somebody outside their scope* — and they are gated differently: Epic 2 carries `DEPARTMENT-EDGE`, `TT-IDENTITY-01`, and the PM/AD-10 cap, none of which touch Epic 1. Merging them would let a blocked dashboard filter hold the risk record hostage, and the record is what unblocks four dashboard slots elsewhere.

**Why not three.** Splitting "S6 is never visible to the employee" into its own epic was rejected: it is not a separable user outcome, and separating it would permit a sprint in which risk records exist before the wall that hides them.

---

## Epic 1: The Risk Record — Level, History, Trend, and the S6 Wall

**Status:** backlog
**Slice-level preconditions:** see *Slice-level preconditions*. No story below may reach production evidence while `SEC-AUTH-01` is open or while `PLAT-E6-S6.4` has not delivered the S6 section decision.

A manager or People Partner records an employee's attrition risk with a level, a description of the situation, details and a date; every earlier record is retained; the current level is the latest one; movement since the previous record is shown as a trend; and the person the record describes cannot reach it through any surface the platform exposes.

**FRs covered:** `PM-FR-21`
**NFRs engaged:** NFR-1, NFR-2, NFR-5, NFR-6, NFR-7
**UX-DRs covered:** RISK-DR1–RISK-DR8, RISK-DR10–RISK-DR12, RISK-DR14

**Surface note (RISK-DR2, RISK-DR9):** this epic introduces **no new page**. S6 renders inside the `user-management` profile host (`PM-FR-12`), so page-level chrome and responsive criteria bind at that host rather than here; the component, state, accessibility, and prohibition patterns (RISK-DR6–RISK-DR8, RISK-DR10–RISK-DR12, RISK-DR14) bind on this epic's own criteria. The only new page in the slice is `RISK-E2-S2.1`.

**Release unit:** Stories 1.1 and 1.4 ship together. Risk records must not exist in a live environment before the projection that hides them is verified.

### Story 1.1: Record a risk with level, description, details, and date

**ID:** `RISK-E1-S1.1` · **Sprint key:** `1-1-record-a-risk-with-level-description-details-and-date`

As a manager or People Partner holding *create and edit risks*,
I want to record where somebody sits on the attrition scale together with the reasoning behind it,
So that retention decisions rest on a dated, attributable record rather than on corridor knowledge.

**Gates:** `OQ-PERM-01` (assignment), risk permission-key existence (unregistered — RSD-9), `AC-SECTION-MATRIX-01` (RSD-3), `SEC-AUTH-01`.

**Acceptance Criteria:**

**Given** I resolve to Reporting-line, Project-line, or People Partner access over Eve **and** hold *create and edit risks*
**When** I record a risk with a level, a description of the situation, details, and a date
**Then** the record is persisted with me as its author and becomes Eve's current risk

**Given** a submitted level outside `low`, `need attention`, `medium`, `high`, `leaver`
**When** it is validated
**Then** it is rejected — the set and its ascending order are fixed by requirements §4.6 and are not runtime-configurable, not seeded from a dictionary, and not extensible through custom fields

**Given** Eve already has risk records
**When** I add a new one
**Then** every earlier record is retained unmodified and the new record is appended — history is append-only by construction, not a mutable current-level field with an audit trail bolted alongside it

**Given** Eve's current level is `high`
**When** I record `low`
**Then** the transition is accepted — the level moves from any state to any state, including downward (requirements §4.6)

**Given** the full API surface of this slice
**When** it is enumerated
**Then** **no** route, field, parameter, or state transition closes, resolves, archives, or terminates a risk — there is no terminal state (RSD-4)

**Given** I hold access over Eve but not *create and edit risks*
**When** I attempt to record a risk
**Then** the response is `403` — section access alone is insufficient, per requirements §2 ("both dimensions must permit an operation")

**Given** I hold *create and edit risks* but resolve to Colleague tier over Eve
**When** I attempt to record a risk for her
**Then** the response is `404` per PM/AD-24 hidden-target precedence, evaluated **before** the permission check, and no record is persisted

**Given** the `leaver` level
**When** the write path and its validation are inspected
**Then** nothing reads, writes, or joins `EmploymentStatus` — `leaver` is a prediction about somebody still working and `dismissed` is the fact of departure (RSD-4)

**Given** my *create and edit risks* permission is revoked
**When** I attempt the next write
**Then** it is refused on that request, with no grace period and no cached grant, and the check is server-side rather than satisfied from the TD-11 five-minute `staleTime` (NFR-7)

**Given** any fixture or seed used to exercise this story
**When** it is inspected
**Then** every description and details value is synthetic — free text is the likeliest carrier of real personal data in this slice (NFR-2)

### Story 1.2: Read the current level and the full history on S6

**ID:** `RISK-E1-S1.2` · **Sprint key:** `1-2-read-current-level-and-full-history-on-s6`

As a manager or People Partner,
I want to open somebody's S6 section and see where they stand now and how they got there,
So that I read a trajectory rather than a single label with no context.

**Gates:** `PLAT-E6-S6.4` (S6 section decision), `AC-SECTION-MATRIX-01` (RSD-3), `SEC-AUTH-01`, `CONFLICT-UM-01`.

**Acceptance Criteria:**

**Given** Eve has several risk records
**When** S6 is assembled for an entitled viewer
**Then** the current level is the **most recent record by date**, and the full history is returned in a deterministic order

**Given** Eve has no risk records
**When** S6 is assembled for an entitled viewer
**Then** the section renders the `.emptyst` empty state — no record yet — and is distinguishable from a section that was withheld (RISK-DR6)

**Given** a Reporting-line viewer and a **Project-line** viewer of Eve
**When** S6 is assembled for each
**Then** both receive the section with `RW` — requirements §3.3 rule 2 deliberately keeps risks in the narrowed project-line set, "which a delivery manager genuinely needs" (RSD-6)

**Given** a People Partner of Eve
**When** S6 is assembled
**Then** the section is returned with `RW`

**Given** the S6 payload
**When** it is assembled
**Then** it is produced by the PM/AD-34 envelope with `canEdit` computed by `access-control`, and **not** by whole-row `User` serialization — the projection this slice consumes is the audience-safe one

**Given** the viewer's entitlement over Eve
**When** S6 is requested
**Then** the section decision comes from the `access-control` facade and this slice adds **no** second filtering layer of its own (RSD-3)

**Given** two risk records carrying the same date
**When** the history is ordered and the current level resolved
**Then** the ordering is deterministic and documented, so identical history always yields the identical current level `[DERIVED — requirements §4.6 orders by date but is silent within a date; PO confirmation item]`

**Given** a manager whose managerial relationship to Eve has just ended
**When** they request S6 on the next request
**Then** the section is no longer returned — platform-owned relationship changes apply on the next request with no cache that outlives the change (NFR-7, PM/AD-25)

### Story 1.3: Trend against the previous record

**ID:** `RISK-E1-S1.3` · **Sprint key:** `1-3-trend-against-the-previous-record`

As a manager or People Partner,
I want to see whether somebody's risk moved up or down since it was last recorded,
So that I react to movement rather than to a static label.

**Gates:** `PLAT-E6-S6.4`, `SEC-AUTH-01`.

**Acceptance Criteria:**

**Given** Eve's previous record was `medium` and her current record is `high`
**When** the trend renders
**Then** an upward direction is shown

**Given** the previous record was `high` and the current record is `medium`
**When** the trend renders
**Then** a downward direction is shown

**Given** the previous and current levels are identical
**When** the trend renders
**Then** **no** trend is shown (requirements §4.6)

**Given** Eve's first and only risk record
**When** the trend renders
**Then** **no** trend is shown (requirements §4.6)

**Given** the trend value
**When** it is served
**Then** it is derived from the two most recent records rather than stored as an independently writable field
**And** where a derived cache or materialized projection is used for performance, it is invalidated by the risk write path and **no** route, admin action, migration, or fixture can set a trend its own history does not produce (RSD-4)

**Given** the trend renders on any surface
**When** it is presented
**Then** direction is conveyed by more than colour alone, and by more than a glyph without an accessible name (RISK-DR8)

**Given** the directory risk/trend column and the dashboard risk widget
**When** they render a trend
**Then** they consume this derivation and add no computation of their own — divergence between the trend this slice serves and the one `PMC-E1-S1.1` renders is a defect (RISK-DR12)

### Story 1.4: Verify the S6 wall — the employee reaches risk through nothing

**ID:** `RISK-E1-S1.4` · **Sprint key:** `1-4-verify-the-s6-wall-across-every-employee-naming-endpoint`

As the platform,
I want risk data to be structurally unreachable by the person it describes,
So that a retention record never becomes the thing that triggers the departure it predicts.

> **This is the highest-risk story in the slice.** S6 is `—` for Self, and §3.3 rule 1 extends that to the API, exports, notifications, search results, and error messages. It **verifies** the `PLAT-E6-S6.4` decision; it does not implement a second wall (RSD-3).

**Gates:** `PLAT-E6-S6.4`, `AC-SECTION-MATRIX-01` (RSD-3), `CONFLICT-UM-01`, `SEC-AUTH-01`, inherited `QUALITY-GATE-AC-NFR` / ACM-9 rerun.

**Acceptance Criteria:**

**Given** Eve requests her own profile, self-service, directory row, dashboard, export, search, or any error path
**When** each response is assembled
**Then** S6 is **absent from the payload** in every one of them — not empty, not null, not marked denied
**And** this is verified by enumerating **every endpoint that accepts or returns an employee identifier**, not by asserting the rule once on the profile route (RSD-5)

**Given** the enumeration above
**When** the story is completed
**Then** its evidence is a **versioned endpoint inventory**, and a standing rule is recorded: any new endpoint accepting or returning an employee identifier extends this negative matrix
**And** the inventory is the artifact a later reader checks against, so a subsequently added endpoint cannot hide behind a check that passed in September

**Given** Eve requests a risk record about herself by identifier
**When** the request is denied
**Then** the response is **identical whether or not a record exists** — a `403` would confirm existence, and for S6 the existence of the record is itself the secret
**And** this extends PM/AD-24, whose hidden-target rule addresses people rather than records; Eve is a **visible** target to herself `[DERIVED — escalated to access-control]`

**Given** a shared link to Eve's profile that names **Eve herself** as its authenticated recipient
**When** S6 is configured on that link
**Then** Eve still does not receive S6 — a link never elevates the subject's own access above the Self cell
**And** because `PM-FR-27` is uncovered, this story **declares the policy** so the sharing engine is not built around the gap; it does not implement the link engine `[DERIVED]`

**Given** any shared link to any recipient
**When** the link is configured
**Then** S6 is `cfg` — off by default **and** requiring explicit re-enabling on every link, which are two separate properties and both apply (requirements §4.8)

**Given** risk descriptions and details
**When** any search surface is built or indexed
**Then** the free text is not reachable by a viewer without S6 entitlement over the subject — §3.3 rule 1 names search results explicitly

**Given** the Access preview surface (EXPERIENCE.md Flow 1)
**When** S6 renders as "not returned" for a non-entitled audience
**Then** the rendering is **identical whether or not a record exists**, so the compliance artifact Kateryna screenshots cannot itself disclose existence

**Given** a Colleague-tier viewer of Eve
**When** the profile response is assembled
**Then** S6 is absent entirely, and the Colleague-view banner's existing claim that risk is never sent holds at the API rather than only at the toggle (RISK-DR14)

**Given** the deferred notification path (PRD §5.1)
**When** any future notification is composed
**Then** no employee receives one derived from S6 — the invariant is already fixed and this story does not weaken it

**Given** verification finds the facade's S6 decision insufficient
**When** the defect is recorded
**Then** it is raised against `PLAT-E6-S6.4` in `access-control` and **not** patched inside the risk context (RSD-3)

**Given** the `PMC` directory export and directory filters
**When** their negative matrices are reviewed
**Then** risk is excluded for the **viewer's own row**, not only for colleague rows — recorded here as a consumer obligation on `PMC-E1`, which owns both surfaces

---

## Epic 2: The Scoped Risk Dashboard

**Status:** backlog
**Slice-level preconditions:** as above. **Depends on Epic 1** — this epic is a read model over its records and adds no write path.

A manager or People Partner opens one page and sees everybody at risk across their whole scope — counts by level with the serious ones emphasised, a table sorted worst-first with trend, filters to narrow it, and drill-through into the record — without that page ever showing them one person more than they were already entitled to see.

**FRs covered:** `PM-FR-22`
**NFRs engaged:** NFR-1, NFR-2, NFR-5, NFR-6, NFR-7
**UX-DRs covered:** RISK-DR1–RISK-DR13

### Story 2.1: The scoped dashboard — active counts and the worst-first table

**ID:** `RISK-E2-S2.1` · **Sprint key:** `2-1-scoped-risk-dashboard-active-counts-and-worst-first-table`

As a manager or People Partner,
I want one page showing everyone at risk in my scope, worst first,
So that Monday starts from the people who need attention rather than from a search box.

**Gates:** `OQ-PERM-01`, the dashboard permission key question (inconsistency 6), `PLAT-E6-S6.4`, `SEC-AUTH-01`, PM/AD-10 scope cap.

**Acceptance Criteria:**

**Given** I hold the dashboard-view permission
**When** I open the risk dashboard
**Then** it renders as a **separate page** — not a fifth PM/AD-33 preset, not a dashboard tab, and not a widget-engine instance (RSD-7)

**Given** the permission key governing this page
**When** it is chosen
**Then** the choice is recorded inline and marked `[DERIVED]` — requirements §2.3 grants *view a given dashboard* per dashboard, while this page is deliberately not one of the four presets, and the sources do not resolve which key applies; `access-control` confirms it (inconsistency 6)

**Given** I do not hold that permission
**When** I request the page
**Then** access is denied fail-closed through `isAllowed`, with **no** fallback to relationship-derived access — holding a functional role never widens data access (requirements §2.3)

**Given** the page resolves my scope
**When** the query is built
**Then** it **delegates to the audience resolver** and does not enumerate audience types itself — no query, read model, or test encodes "reporting line ∪ direct People Partner" as the definition of scope (RSD-10)
**And** a test asserts that when the resolver gains project-line, department, or PP HR-line traversal, this page widens with it and **requires no change in this slice**

**Given** the counters render
**When** they compute
**Then** they include only **active** risks — any level above `low` — with `medium`, `high`, and `leaver` emphasised
**And** a person whose current level is `low` appears in no active-risk counter (requirements §4.6, a fixed product fact)

**Given** the table renders
**When** rows are ordered
**Then** they sort by severity descending, then by date, and each row carries the trend from Story 1.3

**Given** my scope resolves to nobody
**When** the page renders
**Then** it shows the `.emptyst` empty state explaining that my scope is empty — **not** a zero-count dashboard, which a reader could take as evidence that nobody in the organisation is at risk (RISK-DR6)

**Given** my scope resolves successfully and genuinely contains no active risks
**When** the page renders
**Then** measured zeros display in `{typography.data-stat}` and are visually distinguishable from the empty-scope state above

**Given** any counter, table, filter, sort, option list, or export on this page
**When** it is built
**Then** **nothing reads, writes, joins, or excludes on `EmploymentStatus`** — including the plausible-sounding "hide people who already left", which would silently redefine what `leaver` counts (RSD-4)
**And** this is asserted as an executed check over the dashboard read model, because this page is where that join will be attempted

**Given** any counter or table region
**When** it renders
**Then** it carries a `.wscope` footer naming the access policy evaluated, and the header carries a `.prov` `ACCESS` tag (RISK-DR3, RISK-DR4)

**Given** the page is loading
**When** data has not resolved
**Then** a shadcn `Skeleton` matching the counter and table layout renders, not a spinner or a blank region (RISK-DR7)

**Given** a relationship change removes somebody from my scope
**When** I reload the page
**Then** they are gone on the next request, revalidated server-side rather than served from the TD-11 five-minute `staleTime` (NFR-7, PM/AD-25)

**Given** the page at the 500+ seeded scale
**When** performance is recorded
**Then** the scope resolution **and the Story 1.3 trend derivation** are measured with p50, p95, worst case, query count, and `EXPLAIN (ANALYZE, BUFFERS)` — the trend requires each person's two most recent records and is the N+1 shape on this page
**And** the record states explicitly that **NFR-3 is scoped by PRD §8 and SM-4 to All Employees and is neither claimed nor inherited here**, so a later reader cannot mistake this measurement for an NFR-3 pass

**Given** PM/AD-10 project-line traversal is absent
**When** completion is reported
**Then** `PM-FR-22` is recorded as delivered **capped** — Delivery and Project Managers see nothing here — and consuming `PMC` slots must not render an unresolvable audience as a measured zero (RSD-8, RISK-DR13)

**Given** this is the only new page the slice introduces
**When** its chrome is built
**Then** it carries the `.pghd` page header band — mono eyebrow `AREA / SCREEN`, title, one-line lead, and the `{spacing.pghd-accent-width}` accent tick in `{colors.stretch-blue}` — and does **not** use `{colors.stretch-amber}` or `{colors.stretch-violet}`, which carry reserved meanings (RISK-DR2)
**And** its microcopy states what the API returned and which policy was evaluated, with no motivational HR phrasing and no unsourced status claim — a soft euphemism for `leaver` would defeat the requirement that the word mean one thing (RISK-DR10)

**Given** the page at each breakpoint
**When** it renders
**Then** `≥lg` shows the full sidebar and multi-column layout, `md` collapses the sidebar to icons with a 2-column grid, and `<md` moves the sidebar to a `Sheet` with the risk table scrolling horizontally inside its own container (RISK-DR9)

**Given** keyboard and assistive-technology use
**When** the page is exercised
**Then** it meets WCAG 2.2 AA: focus rings use `{colors.ring}`, tab order follows visual layout, any segment or tab control is arrow-key navigable, and `prefers-reduced-motion: reduce` disables all transitions and animations (RISK-DR8)

### Story 2.2: Drill-through — from a count to the filtered table, from a row to the record

**ID:** `RISK-E2-S2.2` · **Sprint key:** `2-2-drill-through-from-count-to-table-and-row-to-profile-s6`

As a manager or People Partner,
I want to click a count and see exactly who it counted, and click a person and land on their record,
So that a number on a dashboard is always answerable rather than something I have to trust.

**Gates:** `PLAT-E6-S6.4`, `SEC-AUTH-01`, `CONFLICT-UM-01`.

**Acceptance Criteria:**

**Given** a level counter showing N people
**When** I drill through
**Then** the table opens filtered to exactly the N people that counter counted — the count and its drill-through resolve from the same scoped query, so they can never disagree

**Given** a table row
**When** I drill through
**Then** I land on that person's profile S6, which re-resolves my entitlement **server-side on arrival** rather than trusting the link that produced it

**Given** my access to somebody ended between the page rendering and my clicking their row
**When** I follow the drill-through
**Then** the response is a `404` per PM/AD-24 — a stale link is not an entitlement, and the previous render is not evidence

**Given** a hand-crafted drill-through URL naming a person, level, or filter outside my scope
**When** it is requested
**Then** the result is my own entitled subset or a `404` — a drill-through narrows within resolved scope and can **never** widen it (RISK-DR11)

**Given** any drill-through target
**When** the destination renders
**Then** it carries its own `.wscope` statement rather than inheriting the originating page's claim, because the scope evaluated there is resolved there (RISK-DR4)

### Story 2.3: Filters by department, project, People Partner, and manager

**ID:** `RISK-E2-S2.3` · **Sprint key:** `2-3-risk-dashboard-filters-department-project-pp-manager`

> 🛑 **GATED — do not enter a sprint.** Department filtering requires `DEPARTMENT-EDGE` (P1 open; PM/AD-35 design ratified, **no table exists, and no story in any slice owns it**). Project filtering requires `TT-IDENTITY-01` (**P0 open** — `User.ttId` has no population source, so no `Relationship type='project'` row can be legitimately created) plus `TT-PMDM-01`. Writing acceptance criteria against a department or project model that does not exist produces criteria that get rewritten on contact with the real one.

As a manager or People Partner,
I want to narrow the risk table by department, project, People Partner, or manager,
So that I can triage a slice of my scope without reading all of it.

**Gates:** `DEPARTMENT-EDGE`, `TT-IDENTITY-01`, `TT-PMDM-01`, `OQ-PERM-01`.

**Acceptance Criteria:**

**Given** the Department entity exists per PM/AD-35 with nesting
**When** I filter by a department
**Then** the table shows people in that department **and its sub-departments**, consistent with the §2.1 department-management rule

**Given** project membership exists with a durable identity join
**When** I filter by project
**Then** the table shows people on that project **within my scope**

**Given** any filter value naming a department, project, People Partner, or manager I hold no access through
**When** the filter applies
**Then** the result is my own entitled subset — a filter narrows within resolved scope and can never widen it

**Given** the filter option lists
**When** they are built
**Then** they contain only values I am entitled to see, so the option list is not itself a directory of departments, projects, People Partners, or managers I cannot otherwise observe (RISK-DR11)

**Given** any combination of these filters
**When** result counts are compared across combinations
**Then** no combination lets me infer the existence, risk level, department, project, People Partner, or manager of a person outside my scope — verified by an **executed differencing check**, not an asserted property

**Given** `DEPARTMENT-EDGE` or `TT-IDENTITY-01` is open
**When** any completion claim is made for the corresponding filter
**Then** it is recorded as **specification evidence only** — a green test against a model that does not exist proves the criterion was written, not that the behaviour holds

---

## Story Coverage Summary

| FR | Epic | Stories | Story coverage |
|---|---|---|---|
| `PM-FR-21` | 1 | 1.1, 1.2, 1.3, 1.4 | Levels, append-only history, no-terminal-state, trend, and the full S6 audience rule. **Capped** — project-line managers can neither read nor record until PM/AD-10 traversal lands (RSD-8) |
| `PM-FR-22` | 2 | 2.1, 2.2, **2.3 (gated)** | Counters, scoped table, ordering, drill-through, and the page's own chrome and accessibility. **Filter clause gated** on `DEPARTMENT-EDGE` and `TT-IDENTITY-01`. **Capped** by the same traversal gap |

**Totals:** 2 epics · 7 stories · 64 acceptance criteria · 1 story hard-gated (2.3) · 1 release unit (1.1 + 1.4) · 0 stories dependent on a later story.

## Step 4 Validation Results

Seven checks. **Five pass, two fail.** Both failures rest on work owned outside this slice and are recorded rather than resolved.

| Check | Result | Detail |
|---|---|---|
| 1. FR coverage | ✅ Pass, qualified | Both FRs carry ≥1 story. Both are **capped** by PM/AD-10 (RSD-8) and `PM-FR-22`'s filter clause is gated. No FR is epic-assigned and story-uncovered |
| 2. Architecture implementation | ✅ Pass | Brownfield; no starter template, so no scaffolding story. The risk entity is created inside Story 1.1, the only story that needs it — nothing is built upfront. Risk's placement in the PM/AD-5 context map is a recorded sprint-entry confirmation, not an assumption |
| 3. Story quality | ✅ Pass | 5–14 criteria per story. Every story names its FR, its gates, and testable Given/When/Then criteria. Derived rules are marked `[DERIVED]` with a named confirmer rather than presented as requirements |
| 4. Epic structure / file churn | ✅ Pass with rationale | Consolidation into one epic was considered and rejected on record: the epics fail differently (subject-reads-own-risk vs viewer-infers-outside-scope) and are gated differently, and merging would bind the record — which unblocks four consumer slots in two other slices — to two blockers with no table and no owning story |
| 5. Dependency validation | ✅ Pass on ordering · ❌ **FAIL** on completeness | Ordering is clean: no story depends on a later story, and Epic 2 depends only on Epic 1. **Epic 2 cannot deliver COMPLETE `PM-FR-22`** while Story 2.3 is gated, and neither epic delivers its FR's full audience while PM/AD-10 lacks project-line traversal |
| 6. Placeholders and formatting | ✅ Pass | No unresolved template placeholders; every UX-DR is covered by ≥1 story criterion |
| 7. Permission-key existence | ❌ **FAIL** — no owner | **No registered blocker guarantees a risk permission key will exist** (RSD-9). `OQ-PERM-01` is assignment-only by its own note; `OQ-AC-EDIT` covers `user-management:edit` and `mentorship:assign` only. Seeding a key in bootstrap is explicitly forbidden. `access-control` must register an entry before any story here is scheduled |

### Validation findings carried forward

**The S6 wall must be verified, never rebuilt.** `PLAT-E6-S6.4` owns the section decision. Story 1.4 verifies it across a versioned endpoint inventory and raises insufficiencies as `access-control` defects. Two implementations of one audience rule is the mechanism by which the Self-view leak gets built — each side assuming the other holds the wall.

**Stories 1.1 and 1.4 must ship in the same release, in that order.** A window in which risk records exist without the S6 projection verified is an NFR-1 critical defect against the section with the strictest Self rule in the product.

**The dashboard, not the record, is where `leaver` will meet `dismissed`.** RSD-4 is enforced at both, but the pressure lands on Story 2.1 as a reasonable-sounding request to hide people who already left. That single filter would redefine what `leaver` counts, and it is asserted as an executed check rather than a stated rule.

**Documenting the scope cap is what makes it dangerous.** The cap appears in RSD-8, both epics, and the coverage notes — so it is easy to mistake for a specification. RSD-10 requires scope to be delegated to the resolver and never enumerated locally, and Story 2.1 carries a criterion that lifting the cap requires no change here. Without it, a green test suite would silently hold the product at Phase-0 after the platform moved past it.

**This slice reopens a closed gate.** `PLAT-E6` stories modify `access-control/**`, invalidating the `QUALITY-GATE-AC-NFR` closure pinned to resolver revision `f89e034`. An ACM-9 rerun is inherited here as a completion condition.

**Two unowned gates block scheduling**, neither fixable inside this slice: no blocker owns risk permission-key existence, and `PLAT-E6-S6.4` has three consumer slices with no owning consumer contract. *(The third — `AC-SECTION-MATRIX-01` unregistered — was closed 2026-09-03; it is registered, names S6, and is carried directly on both requirement rows.)*

**Manual testing remains required for:** the S6 enumeration, where the risk is an endpoint nobody thought to enumerate; the record-existence oracle, which requires comparing responses rather than asserting a status code; and free-text fixture content, where NFR-2 depends on human judgement rather than a schema rule.

**Automation candidates:** the per-audience negative matrix over S6; the versioned endpoint inventory as a drift check; the `leaver`/`dismissed` join check across the dashboard read model; the filter differencing checks in Story 2.3; and the resolver-delegation assertion in Story 2.1 that proves the cap is not hardcoded.
