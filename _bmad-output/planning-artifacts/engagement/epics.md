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
status: final
slice: engagement
id_namespace: ENG-E{epic}-S{story}
updated: 2026-09-02
superseded_sections:
  - epic-4-feedback-records
  - PM-FR-35
---

# People Management — Engagement (Action Items, Campaigns, Risk, Feedback) — Epic Breakdown

## Overview

This document is a **bounded-context slice** decomposing **2 canonical PRD requirements** into implementable stories: the manual action-item lifecycle (`PM-FR-19`) and the form-campaign flow (`PM-FR-20`).

> **`PM-FR-35` superseded.** Feedback is owned by [`feedback/epics.md`](../feedback/epics.md) (`FB-E*`). Epic 4 below is retained for historical traceability only; do not schedule `ENG-E4-S4.*`.
>
> **`PM-FR-21` and `PM-FR-22` superseded (2026-09-02).** Risk is owned by [`risk/epics.md`](../risk/epics.md) (`RISK-E*`). Epic 3 below is retained for historical traceability only; **do not schedule `ENG-E3-S3.*`**, and those identifiers are retired rather than reused. The risk slice re-derived this content against the sources and diverges in three recorded ways: the S6 section decision is owned by `PLAT-E6-S6.4` and consumed rather than reimplemented; the PM/AD-10 scope cap binds the record as well as the dashboard; and the denial oracle is extended to record existence.

**Canonical requirement source:** [prd.md](../prds/prd-people-management-2026-08-24/prd.md) §4.6, §4.7, §4.13 — `PM-FR-*` IDs and §-refs are taken from there and from [docs/project-requirements.md](../../../docs/project-requirements.md) §4.5, §4.6, §4.12, §4.15.

**User journey anchors:** UJ-3 (Anna the People Partner launches a security-awareness form campaign and monitors completion) and UJ-4 (Dmytro the Unit Manager triages unit risks from the risk dashboard, drills into S6, and creates an action item).

**Selection rule:** these 5 FRs are `coverage_status: uncovered` with `stories: []` in [global-fr-epic-story-coverage.yaml](../global-coverage/global-fr-epic-story-coverage.yaml). They are also the largest connected block of uncovered work: `PM-FR-19`, `PM-FR-20`, and `PM-FR-21` are three of the six sources that force `PMC-E2-S2.2` to render unavailable widget slots on every dashboard delivered so far.

**Architecture authority:** [ARCHITECTURE-RATIFICATION.md](../architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md) — `ratified-with-transition-debt`. Design ratification is **not** implementation evidence (§2). Every surface in this slice appears in ratification §4.2 *Confirmed absent or incomplete* ("risks, campaigns, CDS, feedback, and most profile sections"). `action-items` is a bounded context PM/AD-5 records as **confirmed and unimplemented** — this slice creates it.

**Blocker authority:** [blockers.yaml](../architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml). Ratification §7 declares it authoritative, and this slice uses it rather than the §7 prose — see *Recorded inconsistencies* below.

### Cross-context boundaries

| Context | Responsibility in this slice |
|---|---|
| `action-items` | The single task entity, its lifecycle, campaign generation, S14 host, and the PM/AD-23 departure participant |
| `engagement` (risk + feedback) | Risk records and history, feedback records and visibility flags, the scoped risk dashboard read model |
| `access-control` | Functional permissions (`create action items`, `create form campaigns`, `create and edit risks`, `create feedback`), and the **S6 / S8 / S14 section decisions this slice cannot ship without** |
| `user-management` | Employment status (departure trigger), profile host routes for S6/S8/S14, `AccessJournal` (PM/AD-29) |
| Platform capabilities (`PMC-E*`) | Owns the directory filter engine `PM-FR-20` reuses, and the dashboard widget slots this slice's sources unblock |

### Identifier namespace

Stories in this slice use **`ENG-E{epic}-S{story}`**.

`ACF-*`, `ACM-*`, `UMAC-*` are stable workboard identifiers (PRD §0.2) and are **never** reassigned by this slice. No story here claims one.

> **REGISTRATION:** `ENG-E*` is registered in `global-fr-epic-story-coverage.yaml` `namespace_rules` and `source_slices` as part of this run. **PRD §0.2 registration remains open** — §0.2 still enumerates only `PLAT-E*`, `UM-E*`, `M-E*`, `PMC-E*`. Closing it requires a PRD amendment, exactly as `PMC-E*` and `RS-E*` still require.

**Out of scope for this slice:** management notes (S7 — see SD-9); notifications (§4.13, GOOD TO HAVE, PRD §5.1 invariants only); analytics over risk and event history (§4.14, GOOD TO HAVE); the dashboard widgets themselves (owned by `PMC-E2`/`PMC-E3`, which consume this slice read-only); the directory risk column (owned by `PMC-E1-S1.1`'s shared projection); profile sharing of S6/S8 (`PM-FR-27`, uncovered — this slice declares the section policy, it does not build the link engine); the departure executor itself (`PM-FR-41`, `UM-E5`).

### Scope decisions (product owner, 2026-09-02)

Ten decisions. They bind epic and story design and are not re-opened downstream without a new decision.

- **SD-1 — Two of four in-scope FRs have no UX surface at all; the PRD and requirements are the interaction authority.** [EXPERIENCE.md](../ux-designs/ux-people-management-2026-09-02/EXPERIENCE.md) records **No surface** for `PM-FR-20` and `PM-FR-22`, and **display-only** coverage for `PM-FR-19` (a dashboard widget slot) and `PM-FR-21` (a dashboard widget plus a directory column). (`PM-FR-35` feedback is superseded to the `feedback` slice — also **No surface** there.) The sidebar lists risks and campaigns as items without artboards. Stories therefore bind to normative behaviour and to the **already-named** component patterns in the UX spine; they invent no new chrome. A future `bmad-ux` run may add layouts without changing any acceptance criterion here.
- **SD-2 — S6, S8, and S14 section support is a slice-level precondition. The blocker it was owed, `AC-SECTION-MATRIX-01`, was registered 2026-09-03.** `AC-S9-S13` is named for S9–S13, but its own note states the facade "returns `none` for every section other than S1/S10/S11". Every epic in this slice writes to S6, S8, or S14 — all outside both the kernel *and* the `AC-S9-S13` name. **Disposition, updated 2026-09-03: the gate is registered.** `AC-SECTION-MATRIX-01` — the ID the platform slice already used for S2–S8 and S14–S16, whose range is a strict superset of this slice's S6/S8/S14 need — is in `blockers.yaml` as Access Control / P1, naming **Action items section S14** explicitly. This slice previously proposed a separate `AC-S6-S8-S14`; that ID stays **retired as a duplicate**, and the single registration closed the gap for every slice that needed it. Of the three sections, only **S14** is still this slice's own — S6 moved with the risk carve-out and S8 with the feedback carve-out. `AC-S9-S13` was never stretched to cover any of them.
- **SD-3 — The campaign-sender exception is a fixed, campaign-bound projection, never a tier promotion.** Requirements §3.3.7 is the **only** documented exception to the colleague whitelist and it is deliberately narrow. It is implemented as an enumerated projection scoped to one campaign, not as a permission flag, an audience, or a temporary tier. Granting it must be structurally incapable of changing any other endpoint's response for the same viewer/target pair.
- **SD-4 — One task entity with a `source` discriminator.** Requirements §4.5: "Action items are the single task entity in the system." Campaigns generate rows of the same entity with `source = campaign`; they do not create a second task type, a second lifecycle, or a second visibility rule.
- **SD-5 — Risk has no terminal state, and `leaver` is never joined to `dismissed`.** Requirements §4.6: "A risk cannot be closed", and `leaver` is a prediction about somebody still working while `dismissed` is the fact of departure. No API path closes a risk. No query, counter, column, or report joins the risk level to `EmploymentStatus`.
- **SD-6 — The employee never reaches S6 through any surface.** Requirements §4.6: "Never visible to the employee", widened by requirements §3.3 rule 1 to every surface — UI, API, export, notification, search result, error message. This is enumerated as a negative test over every endpoint that can name an employee, not asserted once on the profile route. PRD §5.1 already fixes the same rule for the deferred notification path.
- **SD-7 — Departure participation is specified here and gated, never implemented ahead of the executor.** `action-items.applyDepartureEffects` is a named PM/AD-23 participant in `blockers.yaml` `CC-06`. `CC-06`, `CC-08`, and `CC-09` are all open. The story exists so the contract is not invented later by whoever builds the executor; it carries a hard sprint-entry gate.
- **SD-8 — A campaign audience is frozen at activation, and this is deliberately the opposite of the shared-view rule.** Requirements §4.12 step 2: "The resolved list is frozen when the campaign is activated; people who join later are not added." `PMC` SD-5 requires a *shared directory view* to re-resolve against the recipient's tier on every open. Both are correct because they are different objects — a view is a question, a campaign audience is a commitment. **They must not be unified into one "re-resolution" rule.** The freeze stores a resolved list of people, not a filter.
- **SD-9 — Management notes (S7) are out of scope and, separately, have no owning PM-FR.** The §3.2 matrix specifies S7 with two independent flags, requirements §3.3 rule 3 gives it three normative rules, and UJ-4 has a Unit Manager adding one — yet no requirement in `PM-FR-1`–`PM-FR-42` owns management-note creation or the flag semantics. That is a product-model gap, not a slice omission. **Recorded for escalation; no story here invents an FR.**
- **SD-10 — Derived rules are marked, not smuggled.** Where the requirements and PRD are silent on a case a story must decide (a due date already in the past, a same-day trend tie, campaign items outliving a closed campaign), the story states the chosen rule inline and marks it `[DERIVED]`. Every `[DERIVED]` rule is a Product Owner confirmation item, listed in *Open follow-ups*.

### Slice-level preconditions

Not deliverables of any epic here. Every epic consumes them, so they are stated once, and no story below may reach production evidence while any of them is open.

| Precondition | Severity / status | Why it precedes every epic |
|---|---|---|
| `SEC-AUTH-01` | **P0 open** | `isAllowedForTarget` returns `Boolean(userId)`, permitting **every** operation on **every** target, and the interim session resolver self-provisions a privileged `position: 'HR Admin'` account. Every mutation in this slice — risk, feedback, action item, campaign — inherits both holes. *(2026-09-03 correct-course note: implementation evidence exists on the unmerged `dn-um-implementation` branch — see `blockers.yaml` `status_note`. Not yet merged or independently verified; this precondition stays open.)* |
| S6 / S8 / S14 facade support | **open, unregistered (SD-2)** | The `AccessControlFacade` supports S1/S10/S11 only (ACM-5). Risk (S6), feedback (S8), and action items (S14) each need an approved AD-1 section increment. **No blocker ID covers them** |
| Audience-safe response projection | PM/AD-34 `partial`; ratification §4.2 `absent` | Whole-row `User` serialization can expose non-S1 fields on all six existing handlers. Every profile-hosted section in this slice is assembled through that envelope |
| `OQ-PERM-01` | P1 open | *create action items*, *create form campaigns*, *create and edit risks*, and *create feedback* are all FR-6 grants. The default matrix is unapproved — **do not seed or infer grants** |
| `CONFLICT-UM-01` | P1 open (implementation stale) | PM/AD-24's list-omission and hidden-target-`404` rules bind every list in this slice; the runtime still diverges, so denial tests run against the runtime and not only the contract |
| `PM/AD-25` / `TD-11` | transition debt | The global five-minute frontend `staleTime` can satisfy an immediacy criterion from cache. Every NFR-7 criterion in this slice names it explicitly and requires server-side revalidation |

Owner for the section increments and permission catalog: `access-control`. Owner for the departure executor and journal: `user-management`.

### Recorded inconsistencies in the input set

Findings, not stories. Each was verified mechanically against the cited file.

1. **`QUALITY-GATE-AC` is closed, and the ratification prose says otherwise.** `blockers.yaml` carries `status: closed, closed: 2026-09-02` with `gate_status=PASS`, `p0_status=MET`, `critical_open=0`. Ratification §7 lists it among "P0 open (7)". §7 also declares `blockers.yaml` authoritative, so this slice treats it as closed. **`PMC-E*` carries it as an open P0 precondition and should be corrected.**
2. **The blocker counts in ratification §7 are wrong.** §7 states "30 entries: 18 open, 8 closed, 4 superseded" while §2.1, §10, and §11 all state 16/10/4. A direct count of `blockers.yaml` gives **16 open, 10 closed, 4 superseded, 30 total** — §7's figures are the outlier.
3. **`RS-E1-S2.1` was mis-namespaced — corrected 2026-09-02.** The resourcing slice declares `RS-E{epic}-S{story}` and places that story under its Epic 2, so the ID is `RS-E2-S2.1`. It had been recorded as `RS-E1-S2.1` in both `resourcing/epics.md` and the coverage model; both are now corrected. The sprint key `2-1-s15-request-history-on-profile` was already right and is unchanged.
4. **`PM-FR-11` and `PM-FR-8` reach the risk column through `PMC-E1`, not through this slice.** No story here re-projects a risk value into the directory or an export; that field access already belongs to `PMC-E1-S1.1`'s shared projection and its negative matrix.

## Requirements Inventory

### Functional Requirements

Exactly 5, verbatim-sourced from PRD §4.6, §4.7, §4.13 and requirements §4.5, §4.6, §4.12, §4.15.

- **PM-FR-19** *[PRD §4.6 FR-19]*: Managers (UM/DM/PM) and PP — plus any functional role with *create action items* — create action items for people in their access scope. Fields: title, description, assignee, author, due date, optional link, status, completion date, source. Lifecycle: `open` → `completed` (assignee) or `cancelled` (author, with reason). Overdue items are visually distinguished. Effective departure cancels only **open** items **assigned to** the departing person; items they authored for other active assignees remain open.
  - Consequence: visibility follows S14, whose Colleague cell is `—` and which is in the never-share set `{S3, S7, S13, S14}`.
- **PM-FR-20** *[PRD §4.6 FR-20]*: The author creates a campaign (title, description, purpose, external form URL, due date), selects the audience through the All Employees filter engine (saved views supported; **list frozen on activation**), each recipient receives an action item, the recipient self-reports completion, and the sender sees a per-person completion table with overdue state.
  - Consequence: people joining after activation are not added.
  - Consequence: external form content is never read or verified by the platform.
  - Consequence: the author sees **only** recipient name and **that campaign's** action-item status; no other S14 data and no profile section is widened, and the exception **ends when the campaign closes**.
- **PM-FR-21** *[PRD §4.7 FR-21]*: Risk levels have the fixed ascending order `low` < `need attention` < `medium` < `high` < `leaver`. History is retained and current equals latest. A risk has **no** close or resolved state; the level moves between any levels, including down to `low`. A trend arrow appears only when the level differs from the previous record. `leaver` is a prediction and must never be conflated with `dismissed` employment status.
- **PM-FR-22** *[PRD §4.7 FR-22]*: Counts include only **active** risks (levels above `low`, with `medium`/`high`/`leaver` emphasised); a sortable and filterable table; drill-through to profile S6; scoped to the people over whom the viewer holds Manager or People Partner access.
  - Consequence *(requirements §4.6)*: filterable by department, project, PP, and manager; the table sorts by severity descending, then by date; never visible to the employee.
- **PM-FR-35** *[superseded → `feedback/epics.md`]*: see [`feedback/epics.md`](../feedback/epics.md).

### NonFunctional Requirements

From PRD §8, filtered to what binds this slice.

- **NFR-1** *[PRD §8 NFR-1]*: Access-control correctness is the primary quality attribute; a leak in any section, API surface, export, search result, or notification path is a **critical defect**. This slice touches the three sections with the strictest audience rules in the product: S6 (`—` for Self), S7-adjacent S8 flag gating, and S14 (`—` for Colleague, never shareable).
- **NFR-2** *[PRD §8 NFR-2]*: Seeded test population only. No real PII in fixtures, logs, screenshots, or agent contexts. Feedback bodies and risk descriptions are free text and are the most likely place for real personal data to enter a fixture — fixtures are synthetic by construction.
- **NFR-4** *[PRD §8 NFR-4]*: External integration failure degrades gracefully. The external form URL is stored text; an unreachable form never breaks campaign creation, activation, or completion tracking.
- **NFR-5** *[PRD §8 NFR-5]*: Responsive layout and accessibility for the surfaces introduced here.
- **NFR-6** *[PRD §8 NFR-6]*: English UI only.
- **NFR-7** *[PRD §8 NFR-7]*: Functional-permission revocation is **immediate**; platform-owned relationship changes apply on the **next request**. Binds four separate criteria in this slice: losing *create and edit risks*, losing *create feedback*, flipping a feedback visibility flag, and closing a campaign.

**Not applicable, recorded rather than assumed:** **NFR-3** (2 seconds at 500+ rows) is scoped by PRD §8 and SM-4 to the All Employees list. The risk dashboard performs a comparable Manager/PP scope walk but is not a stated NFR-3 surface. Story 3.4 **measures and records** its scope-resolution cost rather than claiming or inheriting the NFR-3 threshold.

### Additional Requirements

**Architecture (binding)**

- **PM/AD-5 — Bounded-context map:** `action-items` is **confirmed and unimplemented**. This slice creates `src/action-items/` with the `application/domain/infrastructure` layout before any story enters a sprint. Risk and feedback placement is confirmed at the same time.
- **PM/AD-14 — API router tree and context ownership** *(ratified; implementation partial — most routes absent)*: `action-items` is a **top-level collection**, not nested under `/users` — it is a cross-user resource and stays top-level alongside `campaigns`, `resourcing/requests`, `share-links`, and `mentorship-pairs` (`api-conventions.md` §shape 2). The S14 surface is `GET /action-items` for reads and `POST /action-items` plus the **collection-member actions** `POST /action-items/:id/complete` and `POST /action-items/:id/cancel` for the lifecycle transitions. Collection-member actions are part of shape 2 and **no fifth route shape is invented** for the lifecycle. There is no `POST /users/:id/action-items` route: the assignee is a field on the entity, not a path segment.
- **PM/AD-23 — Shared `applyDepartureEffects` contract:** the signature is approved and **no participant implements it**. `action-items.applyDepartureEffects` is a named participant in `blockers.yaml` `CC-06`.
- **PM/AD-24 — HTTP denial oracle:** `401` invalid or inactive session; `404` missing **or hidden-existence** target; `403` visible resource with a forbidden feature or action. **List endpoints omit invisible rows.** Hidden-target `404` precedes mutation permission checks.
- **PM/AD-29 — `AccessJournal`** *(design ratified; no table — `CC-07` P0 open)*: the journal is narrow by design and records only access-changing events. **Nothing in this slice is a journal event** — creating a risk, a feedback record, an action item, or a campaign does not change who can see what. Stated so the journal is not widened into a general audit log.
- **PM/AD-30 — `UserEvents` owner + idempotency** *(design ratified; no model — `CC-09` P0 open)*: no event in this slice is a career-timeline event. Requirements §4.9 fixes the tracked list and it contains no risk, feedback, task, or campaign event.
- **PM/AD-33 — Fixed dashboard read models** *(design ratified; implementation absent)*: **four fixed read models, explicitly no generic widget engine.** The risk dashboard (`PM-FR-22`) is a **separate page** per requirements §4.6, not a fifth dashboard preset and not a widget-engine instance.
- **PM/AD-34 / ARCH-ENV-01 — Profile assembly + envelope** *(design ratified; implementation partial)*: S6, S8, and S14 are assembled into the `user-management`-owned envelope with `canEdit` computed by `access-control`.
- **PM/AD-10 — Live audience and section resolution** *(design partial; implementation partial)*: only Reporting line and direct People Partner Phase-0 audiences exist. **Project-line, department, and PP HR-line traversal are absent** — which caps risk-dashboard scope and every "Manager or People Partner access" clause in this slice.
- **PM/AD-25 — Frontend authorization and cache contract** *(transition debt TD-11)*: the global five-minute `staleTime` conflicts with NFR-7 immediacy and is named in every immediacy criterion here.
- **PM/AD-32 — Custom-field EAV** *(design ratified; TD-12 jsonb transition debt)*: reached indirectly, because campaign audiences are built with the `PM-FR-8` filter engine, which can filter on custom fields. Story 2.1 inherits `PMC-E1-S1.8`'s gate rather than restating it.

**Fixed product facts (not re-decided here)**

- Risk "active" means any level above `low`; a person at `low` is not counted in any active-risk counter (requirements §4.6; already ratified as a fixed fact in `platform/epics.md` Story 1.5).
- The never-share set is `{S3, S7, S13, S14}` — action items can never appear on a shared link under any configuration (requirements §4.8).
- S6 and S8 are `cfg` on a shared link: off by default **and** requiring explicit re-enabling on every link (requirements §4.8, both properties).
- The form campaign is the **only** mechanism for distributing a form, including for requested feedback (requirements §4.12).
- Departure cancels only open items **assigned to** the departing person (requirements CC-06 condition 6; `platform/epics.md` Story 1.8 already asserts this phrase in binding docs).

### UX Design Requirements

**Partial — and mostly absent (SD-1).** EXPERIENCE.md §"PM-FR → surface mapping" records: `PM-FR-19` "Widget only — **no dedicated lifecycle surface**"; `PM-FR-21` "Display only — **no risk management surface**"; `PM-FR-20`, `PM-FR-22`, `PM-FR-35` all "**No surface**". Three of these five FRs also appear in EXPERIENCE.md's own list of 19 PM-FRs with no UX surface.

What *does* bind is the spine's cross-surface contract — the component, state, accessibility, responsive, and prohibition patterns that apply to any new surface in this product. Those are extracted below and are referenced by token name only; values live in [DESIGN.md](../ux-designs/ux-people-management-2026-09-02/DESIGN.md).

- **ENG-DR1**: Every surface introduced here is reached from the existing sidebar groups. EXPERIENCE.md §Information Architecture already lists **risks**, **campaigns**, and **feedback** as sidebar items **without artboards**; this slice populates those targets and does not restructure navigation. The risk dashboard is a **separate page** (requirements §4.6), not a dashboard preset.
- **ENG-DR2**: Every new page carries the page header band `.pghd` (`{components.page-header-band}`): mono eyebrow in `{typography.page-eyebrow}` formatted `AREA / SCREEN`, title in `{typography.page-title}`, one-line lead in `{typography.page-lead}`, and a `{spacing.pghd-accent-width}` accent tick in `{colors.stretch-blue}`. **`{colors.stretch-amber}` and `{colors.stretch-violet}` carry reserved meanings** (timetracker sync, access inspection) and must not be used decoratively on these surfaces.
- **ENG-DR3**: A `.prov` provenance tag (`{components.provenance-tag}`) in the **`ACCESS` variant** is visible in the header of every risk, feedback, and campaign-recipient surface, because all three resolve per request. It carries a text label, is never colour-only, and is never tooltip-only.
- **ENG-DR4**: Any counter or aggregate carries a `.wscope` scope footer (`{components.widget-scope-footer}`) stating in mono uppercase which access policy was evaluated. **A counter never widens viewer entitlement.**
- **ENG-DR5**: Stat values render in `{typography.data-stat}` (Geist Mono).
- **ENG-DR6**: Empty conditions use the empty state `.emptyst` (`{components.empty-state}`): icon, bold line, direction, action.
- **ENG-DR7**: Loading uses a shadcn `Skeleton` matching the target table or card layout, not a spinner or blank region.
- **ENG-DR8**: **WCAG 2.2 AA.** Focus rings use `{colors.ring}`; tab order follows visual layout; segment and tab controls are arrow-key navigable; `prefers-reduced-motion: reduce` disables **all** transitions and animations.
- **ENG-DR9**: Responsive per the spine: `≥lg` full sidebar and multi-column layout; `md` sidebar collapsed to icons and a 2-column grid; `<md` sidebar becomes a `Sheet` and tables scroll horizontally.
- **ENG-DR10**: Microcopy is **direct, honest, permission-literate** — it explains what the API returns and where data came from. Motivational HR phrasing and unsourced status claims are forbidden; gaps are stated, never hidden.
- **ENG-DR11**: **Banned, and testable as negatives**: client-side section hiding as a substitute for server omission; a functional role used to widen data access; inferring hidden values through filter side channels. All three are live risks in this slice — the risk-dashboard filters, the campaign audience preview, and the sender's recipient table are each a candidate side channel.
- **ENG-DR12** *(derived — records an existing contract, does not create one)*: risk level and trend **already have** a display contract as a directory column and a dashboard widget (EXPERIENCE.md, `PMC-E1`, `PMC-E2-S2.2`). This slice supplies their source. **No story here redesigns that display**, and divergence between the risk value this slice serves and the one `PMC-E1-S1.1`'s shared projection renders is a defect.
- **ENG-DR13** *(derived)*: `PMC-E2-S2.2` requires each dashboard slot's availability to key on its **source FR's state**. Completing Epic 1, Epic 2, or Epic 3 flips exactly the corresponding slot and must require no change to any other slot's declaration.

> **UX coverage gaps recorded, not resolved.** None of EXPERIENCE.md's three Key Flows lands on a surface in this slice, even though UJ-3 and UJ-4 in the PRD are entirely about these FRs. There is therefore **no UX-validated end-to-end journey for any of the five FRs here** — the richest gap in the slice, and the strongest argument for a `bmad-ux` run before implementation rather than after.

## FR Coverage Map

| Requirement | Epic | Stories |
|---|---|---|
| `PM-FR-19` — Manual action-item lifecycle | Epic 1 | ENG-E1-S1.1, ENG-E1-S1.2, ENG-E1-S1.3, **ENG-E1-S1.4 (gated)** |
| `PM-FR-20` — Form campaign flow and sender exception | Epic 2 | ENG-E2-S2.1, ENG-E2-S2.2, ENG-E2-S2.3, ENG-E2-S2.4 |
| `PM-FR-21` — Risk record, level, history, and trend | — | **Superseded** → [`risk/epics.md`](../risk/epics.md) `RISK-E1-S1.1` … `S1.4` |
| `PM-FR-22` — Scoped risk dashboard | — | **Superseded** → [`risk/epics.md`](../risk/epics.md) `RISK-E2-S2.1`, `S2.2`, **`S2.3` (gated)** |
| `PM-FR-35` — Feedback records and requested-feedback path | — | **Superseded** → [`feedback/epics.md`](../feedback/epics.md) `FB-E1-S1.1`, `FB-E1-S1.2`, `FB-E2-S2.1` |
| NFR-1, NFR-2 | All epics | Negative tests per audience on S6, S8, and S14 payloads; synthetic fixtures only |
| NFR-4 | Epic 2 | Unreachable external form never blocks creation, activation, or completion |
| NFR-5, NFR-6 | All epics | ENG-DR2, ENG-DR6–ENG-DR10 |
| NFR-7 | Epics 2, 3, 4 | Permission revocation, feedback flag flip, and campaign close each revalidate server-side against TD-11 |
| **Slice-level preconditions (no epic)** | — | `SEC-AUTH-01`; S6/S8/S14 facade support; audience-safe projection; `OQ-PERM-01` |
| **Not covered in this slice** | — | S7 management notes (SD-9); notifications; analytics; the dashboard widgets and directory column that consume these sources |

## Epic List

Three active epics, split on the requirements document's own section boundaries — §4.5 tasks, §4.12 forms, §4.6 risks — rather than on delivery readiness. Epic 4 (§4.15 feedback) is superseded by the `feedback` slice. Each active epic is a distinct user outcome with a distinct audience, and the split coincides with where the dependencies fall.

### Epic 1: Action Item Lifecycle

A manager, People Partner, or any role granted *create action items* assigns a tracked task to somebody in their access scope; the assignee completes it, the author can cancel it with a reason, and overdue work is visible wherever the item appears.

**FRs covered:** `PM-FR-19`

**Audience:** managers (UM/DM/PM), People Partners, holders of *create action items*, and **every employee** as an assignee through self-service.

**Standalone:** yes, given the slice-level preconditions. It is the only epic here with no dependency on another epic, and it is the substrate Epic 2 generates into.

**Enables (without depending on):** Epic 2's campaign items; `PMC-E2-S2.2`'s open and overdue action-item slots on the Unit Manager and People Partner dashboards; the `PM-FR-41` departure transaction's action-item participant.

**Implementation notes:** creates the `action-items` bounded context (PM/AD-5). One entity with a `source` discriminator (SD-4). The `applyDepartureEffects` participant is Story 1.4 and is hard-gated — the epic is otherwise completable without it.

### Epic 2: Form Campaigns and the Sender Exception

A People Partner, manager, or holder of *create form campaigns* distributes an external form to a filter-selected audience as action items, and tracks completion through the one narrow exception to the colleague whitelist that the requirements permit.

**FRs covered:** `PM-FR-20`

**Audience:** holders of *create form campaigns* — explicitly including roles with no managerial access at all (requirements §2.3: "the IT department should be able to run its own security-awareness campaigns without being given managerial access to anyone"). This is the primary test case for the extensible role model.

**Standalone:** no. Requires Epic 1's action-item entity as its delivery mechanism, and the `PMC-E1` directory filter engine as its audience selector.

**Why its own epic:** the §3.3.7 exception is the single most dangerous authorization construct in the product — a documented, deliberate widening of the colleague whitelist. Burying it inside an action-items epic would hide a security-critical boundary inside a task-management story. Requirements §3.3.7 closes with "No other feature may widen the colleague view. If a second such need appears, that is a product decision, not an implementation detail" — that sentence deserves epic altitude.

**Implementation notes:** the frozen audience (SD-8) is a stored list of resolved people, not a stored filter. The exception (SD-3) is a fixed projection bound to one campaign. The platform never fetches the external form (NFR-4).

### Epic 3: Risk Records and the Scoped Risk Dashboard *(superseded)*

A manager or People Partner records an employee's attrition risk with a level, description and date, sees the trend against the previous record, and triages their whole scope from a dedicated risk dashboard — while the employee never learns any of it exists.

**FRs covered:** `PM-FR-21`, `PM-FR-22` — **superseded** to [`risk/epics.md`](../risk/epics.md)

**Audience:** Reporting line, Project line, and People Partner. **Never the employee** (SD-6).

**Why these two together:** requirements §4.6 is one section titled "Risks and Risk Dashboard", and the dashboard has no meaning without records. Splitting them would produce a dashboard epic whose only honest deliverable is an empty state — the failure mode `PMC` SD-2 already documents.

**Standalone:** yes, given the slice-level preconditions. Independent of Epics 1, 2, and 4.

**Enables (without depending on):** `PMC-E2-S2.2`'s active-risk-by-level counters and the risk/trend column in the dashboard people table; `PMC-E1`'s directory risk column and risk-level filter.

**Implementation notes:** the dashboard is a separate page, not a fifth PM/AD-33 preset. Scope is capped by PM/AD-10's missing project and department traversal — Stories 3.1–3.4 run on the Reporting-line and direct-PP audiences that exist; Story 3.5's department and project filters are hard-gated.

### Epic 4: Feedback Records *(superseded)*

A manager or People Partner records structured feedback about an employee with an explicit visibility decision, and collects requested feedback through the one distribution path the product has.

**FRs covered:** `PM-FR-35` — **superseded** to `feedback/epics.md`

**Standalone:** partially. Stories 4.1 and 4.2 are independent; Story 4.3 requires Epic 2.

**Implementation notes:** S8 flag gating is per record and independent of section tier — the same rule shape as S7, and the reason a section-level decision alone is insufficient. Joining interview feedback lives here and never in S5 (requirements §4.15). The absence of a comparison-between-periods feature is an explicit negative, not an omission.

### Epic Dependency Graph

- Slice-level preconditions → **all epics**
- Epic 1 (action-item entity) → Epic 2 (campaign generates items)
- Epic 2 (campaign flow + §3.3.7 tracking) → `feedback` Epic 2 Story 2.1 (`FB-E2-S2.1`, requested feedback — cross-slice dependency)
- `PMC-E1` filter engine (Stories 1.3, 1.6) → Epic 2 Story 2.1
- `CC-06` + `CC-08` + `CC-09` + `OPERATIONAL-ENVELOPE` → **Epic 1 Story 1.4 only — hard sprint-entry block**
- Epic 3 → **superseded**; the risk dependencies (`DEPARTMENT-EDGE`, `TT-IDENTITY-01`, `TT-PMDM-01`) now belong to `RISK-E2-S2.3`

No epic requires a later epic to function.

---

## Epic 1: Action Item Lifecycle

**Status:** backlog
**Slice-level preconditions:** see *Slice-level preconditions*. No story below may reach production evidence while `SEC-AUTH-01` is open or while S14 has no approved section increment.

A manager, People Partner, or any role granted *create action items* assigns a tracked task to somebody in their access scope; the assignee completes it, the author can cancel it with a reason, and overdue work is visible wherever the item appears.

**FRs covered:** `PM-FR-19`
**NFRs engaged:** NFR-1, NFR-2, NFR-5, NFR-6, NFR-7
**UX-DRs covered:** ENG-DR1–ENG-DR11, ENG-DR13

**Context creation:** this epic creates `src/action-items/` per PM/AD-5 and PM/AD-2's hexagonal layout. That is setup inside Story 1.1, not a separate scaffolding story — the architecture specifies no starter template and the backend already exists.

**Route contract (PM/AD-14):** the context exposes the **top-level** `action-items` collection — `GET /action-items`, `POST /action-items`, and the shape-2 collection-member actions `POST /action-items/:id/complete` and `POST /action-items/:id/cancel`. It is never nested under `/users`. S14 on the profile envelope (Story 1.3) is a **read projection assembled by `user-management`** from this collection (PM/AD-34), not a second write path.

### Story 1.1: Create an action item within the author's access scope

**ID:** `ENG-E1-S1.1` · **Sprint key:** `1-1-create-an-action-item-within-access-scope`

As a manager, People Partner, or holder of the *create action items* permission,
I want to assign a titled task with a due date to somebody I hold access over,
So that follow-up work is tracked against a named person instead of living in my head.

**Gates:** `OQ-PERM-01` (*create action items*), S14 facade support (SD-2), `SEC-AUTH-01`.

**Acceptance Criteria:**

**Given** I hold Reporting-line, Project-line, or People Partner access over Eve **and** the *create action items* permission
**When** I create an item with title, description, assignee Eve, due date, and an optional link
**Then** it is persisted with status `open`, `author` set to me, `source` set to `manual`, and no completion date
**And** the optional link may be absent without error

**Given** I hold *create action items* but resolve to **Colleague** tier over Eve
**When** I attempt to create an item assigned to Eve
**Then** the response is `404` for hidden existence or `403` per PM/AD-24 — and **no item is persisted**
**And** the functional permission does not widen my access scope by even one person (`PM-FR-1`, requirements §2.3)

**Given** I hold Reporting-line access over Eve but **not** *create action items*
**When** I attempt to create an item assigned to Eve
**Then** the response is `403` — both dimensions must permit the operation (requirements §2 "Both dimensions must permit an operation")

**Given** a custom functional role granted **only** *create action items*, held by someone with no managerial relationship to anyone
**When** they open the assignee selector
**Then** the selectable population is exactly the people they hold Manager or People Partner access over, resolved per target through the facade
**And** for a holder with no such relationships the population is empty, and the surface says so rather than offering every employee

**Given** a due date already in the past at creation time
**When** the item is submitted
**Then** it is accepted and is immediately overdue — backfilling a missed commitment is a real case and is not rejected `[DERIVED — requirements §4.5 is silent; PO confirmation item]`

**Given** an item with an empty title or no assignee
**When** it is submitted
**Then** it is rejected with a validation error, because an untitled or unassigned task cannot appear meaningfully in S14 or on a dashboard

**Given** any action item is created
**When** the transaction commits
**Then** **no** `AccessJournal` entry and **no** `UserEvents` career-timeline event is written — creating a task changes neither who can see what (PM/AD-29) nor the tracked timeline set (requirements §4.9)

### Story 1.2: Complete, cancel, and overdue state

**ID:** `ENG-E1-S1.2` · **Sprint key:** `1-2-complete-cancel-and-overdue-state`

As an assignee or an item's author,
I want to mark my own work complete or cancel what I asked for with a stated reason,
So that the task list reflects what actually happened rather than accumulating stale rows.

**Gates:** S14 facade support, `SEC-AUTH-01`.

**Acceptance Criteria:**

**Given** an `open` item assigned to me
**When** I mark it complete
**Then** the status becomes `completed`, the completion date is recorded, and the completion date is displayed alongside the due date

**Given** an `open` item assigned to Eve and I hold Reporting-line access over Eve
**When** I attempt to mark it complete on her behalf
**Then** the request is refused — requirements §4.5 assigns completion to the assignee alone, and managerial access over the person does not transfer authorship of the completion signal

**Given** an `open` item I authored
**When** I cancel it with a written reason
**Then** the status becomes `cancelled`, the reason is stored and displayed, and no completion date is set

**Given** an item I authored
**When** I attempt to cancel it with an empty reason
**Then** the request is rejected with a validation error

**Given** an `open` item I did **not** author
**When** I attempt to cancel it
**Then** the request is refused — requirements §4.5 assigns cancellation to the author

**Given** an `open` item whose due date has passed
**When** it renders in S14, in self-service, or on any dashboard
**Then** it is shown as overdue on every one of those surfaces, from the same derived rule rather than a per-surface calculation

**Given** a `completed` or `cancelled` item whose due date has passed
**When** it renders anywhere
**Then** it is **not** shown as overdue — overdue describes outstanding work `[DERIVED]`

**Given** a `completed` or `cancelled` item
**When** any actor attempts to complete, cancel, or reopen it
**Then** the request is refused: both are terminal `[DERIVED — requirements §4.5 states the lifecycle but not its reversibility; PO confirmation item]`

**Given** the two lifecycle transitions
**When** the HTTP adapter is inspected
**Then** they are exactly `POST /action-items/:id/complete` and `POST /action-items/:id/cancel` — top-level shape-2 collection-member actions per PM/AD-14
**And** there is no `/users/:id/action-items/...` transition route and no generic `PATCH` status-write path that would let either transition bypass its own authorization rule

### Story 1.3: S14 visibility on the profile and in self-service

**ID:** `ENG-E1-S1.3` · **Sprint key:** `1-3-s14-visibility-on-profile-and-self-service`

As an employee, manager, or People Partner,
I want action items to appear only where the section matrix permits,
So that a task list never becomes a back channel into somebody's management context.

**Gates:** S14 facade support (SD-2), `CONFLICT-UM-01`, `SEC-AUTH-01`.

**Acceptance Criteria:**

**Given** I am Eve reading my own profile or self-service
**When** S14 is assembled
**Then** I see the items **assigned to me** and may mark them complete
**And** items Eve **authored for other people** are not returned in her own S14 — S14 is "tasks assigned to the person" (requirements §3.2 S14)

**Given** a Reporting-line, Project-line, or People Partner viewer of Eve
**When** S14 is assembled
**Then** the section is returned with `RW` per the §3.2 matrix

**Given** a Colleague-tier viewer of Eve
**When** the profile response is assembled
**Then** S14 is **absent from the payload entirely** — not empty, not a denial marker, not hidden client-side (requirements §3.3 rules 1 and 4, ENG-DR11)

**Given** any shared link to Eve's profile under any configuration
**When** the link payload is assembled
**Then** S14 is absent, because S14 is in the never-share set `{S3, S7, S13, S14}` and cannot be enabled by any link option (requirements §4.8)
**And** this is asserted against the link configuration surface as well as the payload, so no toggle for S14 can exist to be switched on later

**Given** an action item whose title or description was written by a manager while triaging a risk (UJ-4)
**When** the assignee reads it
**Then** the item carries no risk level, trend, or S6 field — an action item is never a transport for S6 content to a Self viewer (SD-6)

**Given** Eve's employment status is `dismissed` with a past effective date
**When** an entitled viewer reads her S14
**Then** her historical items remain readable per the matrix and the profile is read-only, consistent with `PM-FR-41`

**Given** a viewer holding no access over Eve at all
**When** they request Eve's profile
**Then** the response is `404` for hidden existence per PM/AD-24, and the test runs against the runtime rather than the contract, because `CONFLICT-UM-01` records the runtime still diverging

### Story 1.4: Departure participant — cancel only open items assigned to the departing person

**ID:** `ENG-E1-S1.4` · **Sprint key:** `1-4-departure-participant-cancel-assigned-open-items`

> 🛑 **GATED — do not enter a sprint.** Requires `CC-06`, `CC-08`, `CC-09`, and `OPERATIONAL-ENVELOPE` — **four blockers, three of them P0** — and the PM/AD-20 departure executor, which does not exist. This story exists so the participant contract is specified by the context that owns the entity rather than invented later by whoever builds the executor.

As the departure executor,
I want the action-items context to apply exactly the departure effects the requirements specify, inside my transaction,
So that a departure closes the departing person's outstanding work without silently cancelling work they created for others.

**Gates:** `CC-06`, `CC-08`, `CC-09`, `OPERATIONAL-ENVELOPE`, `SEC-AUTH-01`.

**Acceptance Criteria:**

**Given** the executor calls `action-items.applyDepartureEffects`
**When** the participant runs
**Then** it implements the approved PM/AD-23 five-field signature exactly, uses the supplied transaction, and opens **no** nested transaction

**Given** a departing person holding `open` items assigned to them, plus `completed` and `cancelled` items
**When** departure effects apply
**Then** exactly the `open` assigned items become `cancelled — departed`
**And** `completed` and `cancelled` items are untouched

**Given** the departing person authored items assigned to **other, still-active** people
**When** departure effects apply
**Then** those items **remain open** — requirements CC-06 condition 6 and PRD FR-19 both state this explicitly, and it is the single most likely thing for an implementer to get backwards

**Given** the same departure is retried with the same `departureId`
**When** the participant runs again
**Then** the result is identical and no item is cancelled twice, proven through a `sourceDepartureId` and a `status = open` predicate rather than by assuming a single delivery

**Given** the participant commits
**When** the transaction is inspected
**Then** the cancellations occur in the **same transaction** as the `EmploymentStatus` `dismissed` write and the `User.isActive` projection (`CC-06` closure condition 6)

**Given** `CC-06`, `CC-08`, or `CC-09` is open
**When** any completion claim is made for this story
**Then** it is recorded as specification evidence only — a green participant test against a non-existent executor proves the signature, not the behaviour

---

## Epic 2: Form Campaigns and the Sender Exception

**Status:** backlog

> ## 🛑 SPRINT-ENTRY DEPENDENCY — `PMC-E1`
>
> Story 2.1 selects its audience through the All Employees filter engine (requirements §4.12 step 2). That engine is `PMC-E1-S1.3` (filters) and `PMC-E1-S1.6` (saved views), both `specified` and unimplemented, and `PMC-E1` is itself blocked on `SEC-AUTH-01`. **This epic cannot enter a sprint ahead of the directory filter engine**, and building a second, campaign-local filter engine to work around that is explicitly rejected — it would duplicate the entitlement logic that makes the audience preview safe.

A People Partner, manager, or holder of *create form campaigns* distributes an external form to a filter-selected audience as action items, and tracks completion through the one narrow exception to the colleague whitelist that the requirements permit.

**FRs covered:** `PM-FR-20`
**NFRs engaged:** NFR-1, NFR-2, NFR-4, NFR-5, NFR-6, NFR-7
**UX-DRs covered:** ENG-DR1–ENG-DR11, ENG-DR13
**Depends on:** Epic 1 (action-item entity), `PMC-E1-S1.3` and `PMC-E1-S1.6` (filter engine and saved views)

### Story 2.1: Author a campaign and resolve its audience

**ID:** `ENG-E2-S2.1` · **Sprint key:** `2-1-author-a-campaign-and-resolve-its-audience`

As a People Partner, manager, or holder of *create form campaigns*,
I want to describe a form and pick its audience with the same filters I use on All Employees,
So that I can target the right people without asking for access to anybody's profile.

**Gates:** `OQ-PERM-01` (*create form campaigns*), `PMC-E1-S1.3` / `PMC-E1-S1.6`, `SEC-AUTH-01`.

**Acceptance Criteria:**

**Given** I hold *create form campaigns*
**When** I create a campaign with title, description, purpose, external form URL, and due date
**Then** it is persisted in state `draft` with me as the author, and no action item exists yet

**Given** I am building the audience
**When** I apply filters
**Then** the resolution runs through the `PM-FR-8` directory filter engine against **my own** resolved tier, and a saved view may be used as the audience source, transporting configuration only and re-resolving against me rather than replaying its owner's rows (`PMC` SD-5)

**Given** I hold a custom functional role with *create form campaigns* and no managerial relationship to anyone
**When** the audience preview resolves
**Then** every previewed person is returned through the **colleague view** — name and whitelist fields only
**And** no filter combination returns a field outside my tier, and none lets me infer one by comparing result counts (requirements §2.3, §3.3.6, ENG-DR11)

**Given** a resolved audience preview
**When** I add or remove individual people
**Then** the change is applied to the draft audience, because requirements §4.12 step 2 permits adjustment after the filter resolves
**And** a person I add must still be visible to me — I cannot add somebody by identifier whose existence is hidden from me

**Given** the external form URL
**When** the campaign is saved
**Then** the URL is stored as text and **never fetched** by the platform, and an unreachable or invalid destination does not block creation (requirements §4.12 step 4, NFR-4)

**Given** I do **not** hold *create form campaigns*
**When** I attempt to create a campaign
**Then** the response is `403`

**Given** my audience filter references a custom field
**When** the preview resolves
**Then** it inherits `PMC-E1-S1.8`'s gate — custom-field filtering cannot ship ahead of `PM-FR-5` visibility enforcement, and this story does not create a second path around it

### Story 2.2: Activate — freeze the audience and generate action items

**ID:** `ENG-E2-S2.2` · **Sprint key:** `2-2-activate-freeze-the-audience-and-generate-action-items`

As a campaign author,
I want activation to fix the recipient list and put a task on each recipient's profile,
So that the campaign has a defined population and every recipient sees the request where they already look for their work.

**Gates:** Epic 1 complete, `OQ-PERM-01`, S14 facade support.

**Acceptance Criteria:**

**Given** a draft campaign with a resolved audience
**When** I activate it
**Then** the resolved list of **people** is frozen on the campaign, and the campaign moves to state `active`
**And** the freeze stores resolved people rather than the filter, so a later change to the filter engine or to anyone's attributes cannot alter the population (SD-8)

**Given** an activated campaign
**When** a person who was not in the frozen list later comes to match the original filter
**Then** they are **not** added and receive no action item (requirements §4.12 step 2)

**Given** activation completes
**When** action items are generated
**Then** exactly one item exists per frozen recipient, with `source = campaign`, carrying the campaign title, the sender, the campaign due date, and the external form link
**And** the items are the **same entity** as Epic 1's, appear in S14 and self-service, and are completed by the assignee through the same path (SD-4)

**Given** a person I removed during preview
**When** activation completes
**Then** no item exists for them

**Given** the activation request is retried or submitted twice
**When** it is processed
**Then** no recipient receives a duplicate item — generation is idempotent on the campaign identifier `[DERIVED]`

**Given** a recipient departs before completing their campaign item
**When** the `PM-FR-41` departure transaction applies
**Then** their open campaign item is cancelled by the Story 1.4 path like any other assigned open item
**And** the campaign's completion table shows that state distinctly rather than counting it as complete or leaving it indefinitely overdue `[DERIVED — requirements §4.12 does not address departed recipients; PO confirmation item]`

**Given** an active campaign
**When** I attempt to change its audience
**Then** the request is refused — the frozen list is the campaign's commitment, and re-opening it would silently reinterpret an in-flight population `[DERIVED]`

### Story 2.3: The sender's per-person completion table — requirements §3.3.7

**ID:** `ENG-E2-S2.3` · **Sprint key:** `2-3-sender-per-person-completion-table-exception`

As a campaign sender,
I want to see which of my recipients have completed the form and which are overdue,
So that I can chase the right people — and nothing else about them.

> **This is the highest-risk story in the slice.** It is the only construct in the product that deliberately widens the colleague whitelist. Requirements §3.3.7 defines it in four clauses and closes with "No other feature may widen the colleague view."

**Gates:** S14 facade support, `SEC-AUTH-01`, `CONFLICT-UM-01`.

**Acceptance Criteria:**

**Given** I am the author of an active campaign
**When** I open its completion table
**Then** I see each recipient **by name** together with the status of **that campaign's** action item, and the derived overdue state of that item — and nothing else

**Given** I authored campaign A and somebody else authored campaign B covering some of the same people
**When** I open my table
**Then** campaign B's recipients and statuses are absent, even for people who appear in both (requirements §3.3.7: "that campaign's own recipients and nobody else")

**Given** a recipient over whom I hold only Colleague tier
**When** the table payload is assembled
**Then** it contains no other S14 item of theirs, no unrelated due date, no other campaign, and no field from any other section — I still resolve to Colleague over that person on every other endpoint **in the same session** (requirements §3.3.7)

**Given** the exception is granted for my campaign
**When** the same viewer/target pair is requested on **any** other endpoint in the product
**Then** the response is byte-for-byte what it would be without the campaign — the widened field set is an enumerated projection bound to this surface, not a permission grant, an audience, or a tier promotion (SD-3)
**And** this is verified by an executed comparison across every endpoint that accepts an employee identifier, not asserted as a property

**Given** a recipient over whom I **do** hold Reporting-line tier
**When** the completion table renders
**Then** it shows the same fixed projection as for a Colleague-tier recipient — the surface's shape does not vary with my tier, so a leak cannot hide behind "that viewer was entitled anyway" (SD-3)

**Given** the overdue state in the table
**When** it is computed
**Then** it derives from that item's own due date and from nothing else about the recipient

**Given** the table renders
**When** the page chrome is inspected
**Then** it carries a `.prov` `ACCESS` tag and a `.wscope` footer naming the §3.3.7 exception explicitly, because a viewer seeing names they normally cannot see should be told why (ENG-DR3, ENG-DR4, ENG-DR10)

### Story 2.4: Close the campaign and end the exception

**ID:** `ENG-E2-S2.4` · **Sprint key:** `2-4-close-the-campaign-and-end-the-exception`

As a campaign sender,
I want closing the campaign to end my elevated view of its recipients,
So that a finished campaign stops being a standing window into people I have no relationship with.

**Gates:** `SEC-AUTH-01`, `PM/AD-25` / `TD-11`.

**Acceptance Criteria:**

**Given** an active campaign I authored
**When** I close it
**Then** the campaign state becomes `closed` and the §3.3.7 exception ends on the **next request** (requirements §3.3.7: "it ends when the campaign is closed"; NFR-7)

**Given** the campaign is closed
**When** I request its completion table
**Then** recipients over whom I hold no independent tier are no longer named, and I resolve to my normal tier over every former recipient
**And** the check is a **server-side revalidation**: PM/AD-25's global five-minute `staleTime` (TD-11) would otherwise let a cached response keep naming them for up to five minutes, which is the specific divergence this criterion exists to catch

**Given** the campaign is closed
**When** the campaign record is read
**Then** it retains aggregate completion counts for the sender
**And** per-recipient names are returned only where the sender's own tier independently permits them `[DERIVED — requirements §3.3.7 ends the exception but does not say what the closed campaign shows; PO confirmation item]`

**Given** recipients still hold `open` campaign action items when the campaign closes
**When** those items are read
**Then** they remain open and completable — closing the campaign ends the sender's reporting window, not the recipient's obligation `[DERIVED; PO confirmation item]`

**Given** somebody other than the author attempts to close the campaign
**When** the request is made
**Then** it is refused unless they independently hold *create form campaigns* over this campaign's authorship, so the exception cannot be extended or terminated by an unrelated actor `[DERIVED]`

---

## Epic 3: Risk Records and the Scoped Risk Dashboard *(superseded)*

> 🛑 **SUPERSEDED 2026-09-02 — do not schedule.** `PM-FR-21` and `PM-FR-22` are owned by [`risk/epics.md`](../risk/epics.md) (`RISK-E*`). The stories below are retained for historical traceability only; `ENG-E3-S3.1` … `ENG-E3-S3.5` are **retired identifiers** and are never reused or reassigned. The coverage model points both FRs at `RISK-E*` stories.

**Status:** superseded
**Slice-level preconditions:** as above, plus S6 facade support. No story below may reach production evidence while `SEC-AUTH-01` is open.

A manager or People Partner records an employee's attrition risk with a level, description and date, sees the trend against the previous record, and triages their whole scope from a dedicated risk dashboard — while the employee never learns any of it exists.

**FRs covered:** `PM-FR-21`, `PM-FR-22`
**NFRs engaged:** NFR-1, NFR-2, NFR-5, NFR-6, NFR-7
**UX-DRs covered:** ENG-DR1–ENG-DR13

**Scope cap from PM/AD-10.** "Manager or People Partner access" in `PM-FR-22` resolves today to **Reporting line and direct People Partner only**. Project-line, department, and PP HR-line traversal are absent, so a Delivery Manager sees nothing through this dashboard until that traversal exists — a real coverage limit, recorded here rather than papered over with a broader claim.

### Story 3.1: Record a risk with level, description, details, and date

**ID:** `ENG-E3-S3.1` · **Sprint key:** `3-1-record-a-risk-with-level-description-details-and-date`

As a manager or People Partner with the *create and edit risks* permission,
I want to record where somebody sits on the attrition scale with the reasoning behind it,
So that retention decisions rest on a dated record rather than on corridor knowledge.

**Gates:** `OQ-PERM-01` (*create and edit risks*), S6 facade support (SD-2), `SEC-AUTH-01`.

**Acceptance Criteria:**

**Given** I hold Reporting-line, Project-line, or People Partner access over Eve **and** *create and edit risks*
**When** I record a risk with a level, a description of the situation, details, and a date
**Then** the record is persisted and becomes Eve's current risk

**Given** a level value outside `low`, `need attention`, `medium`, `high`, `leaver`
**When** it is submitted
**Then** it is rejected — the set and its ascending order are fixed by requirements §4.6 and are not runtime-configurable

**Given** Eve already has risk records
**When** I add a new one
**Then** the previous records are retained unmodified, and the current level is the most recent record by date — history is append-only, not an audit log bolted onto a mutable field

**Given** any risk record
**When** the API surface is enumerated
**Then** **no** route, field, or state transition closes or resolves a risk — there is no terminal state (SD-5, requirements §4.6 "A risk cannot be closed")

**Given** Eve's current level is `high`
**When** I record `low`
**Then** the transition is accepted — the level moves from any state to any state, including downward

**Given** I hold access over Eve but **not** *create and edit risks*
**When** I attempt to record a risk
**Then** the response is `403`

**Given** I hold *create and edit risks* but resolve to Colleague tier over Eve
**When** I attempt to record a risk for her
**Then** the response is `404` or `403` per PM/AD-24 and no record is persisted

**Given** the `leaver` level
**When** any query, counter, column, filter, or report is built
**Then** it never reads, writes, or joins `EmploymentStatus` — `leaver` is a prediction about somebody still working and `dismissed` is the fact of departure (SD-5)
**And** this is asserted as an executed check over the risk read models, because "we had 14 leavers last quarter" must resolve to exactly one meaning (requirements §4.6)

### Story 3.2: Trend against the previous record

**ID:** `ENG-E3-S3.2` · **Sprint key:** `3-2-trend-against-the-previous-record`

As a manager or People Partner,
I want to see whether somebody's risk went up or down since the last time it was recorded,
So that I react to movement rather than to a static label.

**Gates:** S6 facade support.

**Acceptance Criteria:**

**Given** Eve's previous record was `medium` and her current record is `high`
**When** the trend renders
**Then** an upward arrow is shown

**Given** the previous record was `high` and the current record is `medium`
**When** the trend renders
**Then** a downward arrow is shown

**Given** the previous and current levels are identical
**When** the trend renders
**Then** **no** arrow is shown (requirements §4.6)

**Given** Eve's first and only risk record
**When** the trend renders
**Then** **no** arrow is shown

**Given** two risk records carrying the same date
**When** the previous record is selected for comparison
**Then** the ordering is deterministic and documented, so the same history always produces the same arrow `[DERIVED — requirements §4.6 orders by date but not within a date; PO confirmation item]`

**Given** the trend value
**When** it is stored or served
**Then** it is derived at read time from the two most recent records and is never persisted as an independently mutable field, so it cannot drift from the history it summarises `[DERIVED]`

**Given** the trend arrow renders on any surface
**When** it is presented
**Then** direction is conveyed by more than colour alone, per the ENG-DR8 accessibility floor

### Story 3.3: S6 is never visible to the employee, on any surface

**ID:** `ENG-E3-S3.3` · **Sprint key:** `3-3-s6-never-visible-to-the-employee-on-any-surface`

As the platform,
I want risk data to be structurally unreachable by the person it describes,
So that a retention record never becomes the thing that triggers the departure it predicts.

**Gates:** S6 facade support (SD-2), `CONFLICT-UM-01`, `SEC-AUTH-01`.

**Acceptance Criteria:**

**Given** Eve requests her own profile, self-service, directory row, dashboard, export, or any action item
**When** each response is assembled
**Then** S6 is **absent from the payload** in every one of them — requirements §3.3 rule 1 extends "no access" to the API, exports, notifications, search results, and error messages, and requirements §4.6 states S6 is never visible to the employee
**And** this is verified by **enumerating every endpoint that accepts or returns an employee identifier**, not by asserting the rule once on the profile route (SD-6)

**Given** a Reporting-line or **Project-line** viewer of Eve
**When** S6 is assembled
**Then** the section is returned with `RW` — requirements §3.3 rule 2 deliberately keeps risks in the narrowed project-line set, because "a delivery role needs skills, availability, risks and history"

**Given** a People Partner of Eve
**When** S6 is assembled
**Then** the section is returned with `RW`

**Given** a Colleague-tier viewer of Eve
**When** the profile response is assembled
**Then** S6 is absent entirely, not empty and not marked denied

**Given** any shared link to Eve's profile
**When** the link is configured
**Then** S6 is `cfg` — **off by default and requiring explicit re-enabling on every link**, which are two separate properties and both apply (requirements §4.8)
**And** because `PM-FR-27` is uncovered, this story **declares the section policy** so the future sharing slice cannot default it on; it does not build the link engine

**Given** the directory risk column and the dashboard risk widget
**When** they render a risk value
**Then** they consume this projection and add no field access of their own, and divergence between what this slice serves and what `PMC-E1-S1.1`'s shared projection renders is a defect (ENG-DR12)

**Given** the deferred notification path (PRD §5.1)
**When** any future notification is composed
**Then** an employee never receives one derived from S6 — the invariant is already fixed and this story does not weaken it

### Story 3.4: Scoped risk dashboard — counts, table, and drill-through

**ID:** `ENG-E3-S3.4` · **Sprint key:** `3-4-scoped-risk-dashboard-counts-table-and-drill-through`

As a manager or People Partner,
I want one page showing everyone at risk in my scope, worst first,
So that Monday starts from the people who need attention rather than from a search box.

**Gates:** `OQ-PERM-01` (*view a given dashboard*), S6 facade support, `SEC-AUTH-01`, PM/AD-10 scope cap.

**Acceptance Criteria:**

**Given** I hold the relevant dashboard-view permission
**When** I open the risk dashboard
**Then** it renders scoped to exactly the people I hold Manager or People Partner access over, resolved **per target** through the facade and never inferred from holding a functional role

**Given** I do not hold the dashboard-view permission
**When** I request the page
**Then** access is denied fail-closed through `isAllowed`, with no fallback to relationship-derived access

**Given** the counters render
**When** they compute
**Then** they count only **active** risks — any level above `low` — with `medium`, `high`, and `leaver` emphasised
**And** a person whose current level is `low` is counted in no active-risk counter (requirements §4.6, already a fixed product fact)

**Given** the table renders
**When** rows are ordered
**Then** they sort by severity descending, then by date, and each row shows the trend arrow from Story 3.2

**Given** a counter or a row
**When** I drill through
**Then** a count opens the filtered table and a row opens that person's profile S6

**Given** I hold Manager or People Partner access over nobody
**When** I open the page
**Then** it renders the `.emptyst` empty state explaining that my scope is empty — **not** a zero-count dashboard, which a reader could take as evidence that nobody in the organisation is at risk (ENG-DR6, mirroring `PMC` Story 2.2's measured-versus-unavailable rule)

**Given** my scope resolves successfully and genuinely contains no active risks
**When** the page renders
**Then** measured zeros display normally in `{typography.data-stat}` and are visually distinguishable from the empty-scope state

**Given** any counter or table region
**When** it renders
**Then** it carries a `.wscope` footer stating the access policy evaluated, and the header carries a `.prov` `ACCESS` tag (ENG-DR3, ENG-DR4)

**Given** the page at the 500+ seeded scale
**When** performance is claimed
**Then** the Manager/PP scope-resolution cost and the risk query are **measured and recorded** with p50, p95, worst case, query count, and `EXPLAIN (ANALYZE, BUFFERS)`
**And** the record explicitly states that **NFR-3 is scoped to All Employees and is neither claimed nor inherited here**, so a future reader cannot mistake this measurement for an NFR-3 pass

**Given** the dashboard is loading
**When** data has not resolved
**Then** a shadcn `Skeleton` matching the counter and table layout renders (ENG-DR7)

### Story 3.5: Risk dashboard filters by department, project, People Partner, and manager

**ID:** `ENG-E3-S3.5` · **Sprint key:** `3-5-risk-dashboard-filters-by-department-project-pp-and-manager`

> 🛑 **GATED — do not enter a sprint.** Department filtering requires `DEPARTMENT-EDGE` (P1 open; PM/AD-35 design ratified, **no table exists**) and project filtering requires `TT-IDENTITY-01` (**P0 open**) plus `TT-PMDM-01`. Writing acceptance criteria against a project or department model that does not exist would produce criteria that get rewritten on contact with the real one.

As a manager or People Partner,
I want to narrow the risk table by department, project, People Partner, or manager,
So that I can triage a slice of my scope without reading all of it.

**Gates:** `DEPARTMENT-EDGE`, `TT-IDENTITY-01`, `TT-PMDM-01`, `OQ-PERM-01`.

**Acceptance Criteria:**

**Given** the Department entity exists per PM/AD-35 with nesting
**When** I filter by a department
**Then** the table shows people in that department **and its sub-departments**, consistent with the §2.1 department-management access rule

**Given** project membership exists with a durable identity join
**When** I filter by project
**Then** the table shows people on that project within my scope

**Given** any filter value naming a department, project, People Partner, or manager I hold no access through
**When** the filter applies
**Then** the result is my own entitled subset — a filter narrows within my resolved scope and can **never** widen it

**Given** the filter option lists
**When** they are built
**Then** they contain only values I am entitled to see, so the option list itself is not a directory of departments, projects, or managers I cannot otherwise observe (ENG-DR11)

**Given** any combination of these filters
**When** result counts are compared across combinations
**Then** no combination lets me infer the risk level, department, project, People Partner, or manager of a person outside my scope, verified by an executed differencing check rather than an asserted property

**Given** `TT-IDENTITY-01` is open
**When** any completion claim is made for the project filter
**Then** it is recorded as specification evidence only

---

## Epic 4: Feedback Records

> **SUPERSEDED** by [`feedback/epics.md`](../feedback/epics.md). Coverage owner: `FB-E*`. Do not schedule stories below.

**Status:** superseded
**Slice-level preconditions:** as above, plus S8 facade support.

A manager or People Partner records structured feedback about an employee with an explicit visibility decision, and collects requested feedback through the one distribution path the product has.

**FRs covered:** `PM-FR-35`
**NFRs engaged:** NFR-1, NFR-2, NFR-5, NFR-6, NFR-7
**UX-DRs covered:** ENG-DR1–ENG-DR11
**Depends on:** Epic 2, for Story 4.3 only

### Story 4.1: Create a feedback record with an explicit visibility decision

**ID:** `ENG-E4-S4.1` · **Sprint key:** `4-1-create-a-feedback-record-with-explicit-visibility`

As a manager, People Partner, or holder of the *create feedback* permission,
I want to record feedback about somebody with a deliberate decision about whether they see it,
So that candid management input and shared developmental feedback can both exist without one becoming the other by accident.

**Gates:** `OQ-PERM-01` (*create feedback*), S8 facade support (SD-2), `SEC-AUTH-01`.

**Acceptance Criteria:**

**Given** I hold applicable S8 access over Eve **and** the *create feedback* permission
**When** I create a record with subject, date, context (project, event, or period), and body
**Then** it is persisted with me as the author and visibility **management only** — the default, never inferred from my role

**Given** I hold S8 `RW` over Eve but **not** *create feedback*
**When** I attempt to create a record
**Then** the response is `403` — PRD FR-35 requires both dimensions, matching the FR-29 pattern where section access alone is insufficient

**Given** I hold *create feedback* but resolve to Colleague tier over Eve
**When** I attempt to create a record about her
**Then** the response is `404` or `403` per PM/AD-24 and no record is persisted

**Given** joining interview feedback
**When** it is recorded
**Then** it is created as an S8 feedback record with a context, and **no** path writes it to S5 Documents — requirements §4.15 places it here precisely so the employee sees it only if somebody deliberately shares it

**Given** a set of records about Eve
**When** they are listed
**Then** they are ordered chronologically and can be filtered by period

**Given** the feedback surface
**When** its capabilities are enumerated
**Then** **no** comparison-between-periods feature exists — requirements §4.15 states the body is free text and there is nothing to compare, so its absence is an asserted negative rather than an unbuilt backlog item

**Given** a record is created
**When** the transaction commits
**Then** no `AccessJournal` entry and no career-timeline event is written (PM/AD-29, requirements §4.9)

### Story 4.2: S8 read projection and the per-record visibility flag

**ID:** `ENG-E4-S4.2` · **Sprint key:** `4-2-s8-read-projection-and-per-record-visibility-flag`

As an employee, manager, or People Partner,
I want feedback to reach exactly the audience each record was marked for,
So that a section-level permission never becomes a way to read records that were never shared.

**Gates:** S8 facade support, `CONFLICT-UM-01`, `SEC-AUTH-01`.

**Acceptance Criteria:**

**Given** Eve reads her own profile
**When** S8 is assembled
**Then** she receives **only** records flagged *shared with employee*
**And** management-only records are **absent from the payload**, not returned and masked — flag gating is a projection decision, not a rendering decision (requirements §3.3 rule 1, ENG-DR11)

**Given** a Reporting-line, Project-line, or People Partner viewer of Eve
**When** S8 is assembled
**Then** the section is returned with `RW` per the §3.2 matrix, including records flagged management only

**Given** a Colleague-tier viewer of Eve
**When** any surface is assembled
**Then** S8 is absent entirely, and no list, filter, count, or search result reveals that feedback about Eve exists (requirements §4.15 "A colleague cannot browse feedback about another person")

**Given** a record currently flagged *shared with employee*
**When** an entitled actor flips it back to management only
**Then** Eve's **next request** no longer returns it
**And** the check is a server-side revalidation, because PM/AD-25's TD-11 five-minute `staleTime` could otherwise keep serving the record from cache in violation of NFR-7

**Given** a record flagged management only that is later shared
**When** Eve next reads S8
**Then** the record appears, on the same next-request timing

**Given** any shared link to Eve's profile
**When** the link is configured
**Then** S8 is `cfg` — off by default **and** requiring explicit re-enabling on every link (requirements §4.8) — declared here so the future `PM-FR-27` slice cannot default it on
**And** a shared link never grants write access to S8

**Given** flag-gated records exist alongside section-level access
**When** entitlement is evaluated
**Then** the per-record flag is applied **after** the section decision and can only narrow it — a section `RW` never overrides a record's flag, which is the same rule shape S7 uses and the reason a section decision alone is insufficient (PRD FR-4)

### Story 4.3: Requested feedback through a form campaign

**ID:** `ENG-E4-S4.3` · **Sprint key:** `4-3-requested-feedback-through-a-form-campaign`

As a manager or People Partner,
I want to ask several people for input about somebody and then record what came back,
So that requested feedback uses the distribution path the product already has instead of a second one.

**Gates:** Epic 2 complete, `OQ-PERM-01` (*create form campaigns* and *create feedback*), S8 facade support.

**Acceptance Criteria:**

**Given** I want feedback about Eve from named individuals
**When** I initiate the request
**Then** it runs as a form campaign (Epic 2) targeted at those individuals — and the campaign is the **only** distribution mechanism

**Given** the feedback surface and the campaign surface
**When** the API is enumerated
**Then** **no** feedback-specific send, notify, request, or distribute endpoint exists — requirements §4.12 states "Do not build a second distribution path", asserted as an executed negative

**Given** an active requested-feedback campaign
**When** I track responses
**Then** I see completion status through the Story 2.3 §3.3.7 projection and nothing wider
**And** the platform reads nothing from the external form and verifies nothing about its contents

**Given** responses have come back through the external form
**When** I record them
**Then** I enter each one **manually** as an S8 record through Story 4.1 — nothing becomes a feedback record automatically (requirements §4.15)

**Given** a manually entered record originating from a campaign response
**When** it is created
**Then** it is an ordinary S8 record subject to Story 4.2's projection, and its visibility defaults to **management only** like any other — the fact that a colleague wrote the underlying text does not make it shared with the subject

**Given** a record is linked back to its source campaign
**When** the link is read
**Then** the association is optional metadata and **never** widens who may read the record, and never exposes the campaign's recipient list to an S8 reader `[DERIVED]`

**Given** the campaign is closed
**When** I record feedback afterwards
**Then** recording still works — Story 2.4 ends the sender's recipient-name window, not my ability to write S8 records about Eve, which rests on my own S8 access `[DERIVED]`

---

## Story Coverage Status

Honest state of story-level coverage. **2 FRs remain in scope** (`PM-FR-19`, `PM-FR-20`); `PM-FR-21`/`PM-FR-22` are superseded to `risk/epics.md` and `PM-FR-35` to `feedback/epics.md`. The rows and validation results below were written against the original 5-FR scope and are preserved as the record of that run — read them as historical for every superseded row.

| FR | Epic | Stories | Story coverage |
|---|---|---|---|
| `PM-FR-19` | 1 | 1.1, 1.2, 1.3, **1.4 (gated)** | Creation, lifecycle, and S14 visibility covered. **Departure clause gated** on `CC-06`/`CC-08`/`CC-09` and the absent executor |
| `PM-FR-20` | 2 | 2.1, 2.2, 2.3, 2.4 | Covered end to end, including the §3.3.7 exception and its termination. Depends on `PMC-E1`'s filter engine |
| `PM-FR-21` | — | — | **Superseded** — see [`risk/epics.md`](../risk/epics.md) |
| `PM-FR-22` | — | — | **Superseded** — see [`risk/epics.md`](../risk/epics.md) |
| `PM-FR-35` | — | — | **Superseded** — see [`feedback/epics.md`](../feedback/epics.md) |

**Totals:** 4 epics · 16 stories · 113 acceptance criteria · 2 stories hard-gated (1.4, 3.5) · 1 story dependent on another epic (4.3) · 1 epic dependent on an out-of-slice epic (Epic 2 on `PMC-E1`).

## Step 4 Validation Results

Six checks run. **Four pass, two fail.** The failures are recorded rather than resolved, because each rests on a blocker owned outside this slice.

| Check | Result | Detail |
|---|---|---|
| 1. FR coverage | ✅ Pass, qualified | All 5 in-scope FRs carry ≥1 story. Two FRs are partial by gate: `PM-FR-19`'s departure clause (Story 1.4) and `PM-FR-22`'s filter clause (Story 3.5). Unlike `PMC` SD-7, no FR here is epic-assigned and story-uncovered |
| 2. Architecture implementation | ✅ Pass | Brownfield; no starter template is specified, so no scaffolding story exists. The `action-items` context is created inside the first story that needs it, not upfront |
| 3. Story quality | ✅ Pass | 5–10 criteria per story, median 7. Every story names its FR, its gates, and testable Given/When/Then criteria. Derived rules are marked `[DERIVED]` rather than presented as requirements |
| 4. Epic structure / file churn | ✅ Pass with rationale | Split on the requirements document's own §4.5 / §4.12 / §4.6 / §4.15 boundaries. Epics 1↔2 share the action-item entity, which is a deliberate dependency (SD-4), not incidental overlap |
| 5. Dependency validation | ❌ **FAIL** on completeness · ✅ pass on ordering | Ordering is clean: no story is blocked by a later story and no epic requires a later epic. **Epic 1 cannot deliver COMPLETE `PM-FR-19`** while Story 1.4 is gated on three open P0s, and **Epic 3 cannot deliver COMPLETE `PM-FR-22`** while Story 3.5 is gated. Additionally Epic 2 depends on `PMC-E1`, an epic outside this slice |
| 6. Placeholders and formatting | ✅ Pass | No unresolved placeholders |
| 7. Section-support precondition | ✅ **Resolved 2026-09-03** | **Recorded at the time as unowned (SD-2).** Superseded twice: `PLAT-E6-S6.4` owns S6/S7/S8 and `PLAT-E6-S6.5` owns S12/S14/S15, both `specified` in `platform/epics.md`; and `AC-SECTION-MATRIX-01` is now **registered** in `blockers.yaml`, naming S14. `AC-S9-S13` covers S9/S12/S13 only and was never stretched here. For this slice the live need is **S14** — S6 moved with the risk carve-out and S8 with the feedback carve-out |

### Validation findings carried forward

**The unowned section increment is the single biggest risk in this slice.** `AccessControlFacade` returns `none` for every section except S1, S10, and S11. This slice writes to S6, S8, and S14 — none of which falls in `AC-S9-S13`'s declared range. If nobody registers and schedules that increment, all four epics unblock on paper while remaining unbuildable. **Owner must be assigned in `access-control` before any story here enters a sprint.**

**Stories 2.3 and 2.4 must ship in the same release.** They pass the dependency check independently, but 2.3 grants the §3.3.7 exception and 2.4 is the only thing that ends it. Shipping 2.3 alone produces a permanent, unrevocable widening of the colleague whitelist for every campaign ever created. Correct ordering, dangerous release boundary — the same shape as `PMC`'s 2.1/2.2 finding, with a security consequence instead of a clarity one.

**Stories 3.1 and 3.3 must ship in the same release, in that order.** *(Superseded — carried into `risk/epics.md` as the `RISK-E1-S1.1` / `RISK-E1-S1.4` release unit.)* 3.1 creates risk records; 3.3 is what stops the subject reading them. A window in which risk records exist without the S6 projection enforced is an NFR-1 critical defect against the most sensitive section in the product.

**The §3.3.7 exception is the only place in this slice where a leak would be invisible to a section test.** Every other criterion here is a section-matrix cell that a per-audience negative matrix will catch. Story 2.3's exception is, by design, a legitimate widening — so a bug in its scoping looks like correct behaviour to any test that only asks "is this viewer entitled to this section". That is why 2.3 requires an executed cross-endpoint comparison rather than an asserted property, and why the exception is a fixed projection rather than a tier promotion (SD-3).

**Two authorization dimensions are asserted independently in every mutation story.** Requirements §2 states "Both dimensions must permit an operation", and this slice introduces four new FR-6 permissions. Each mutation story carries two separate negative criteria — access without permission, and permission without access — because a single combined test passes when either check is implemented and the other is missing.

**`PM-FR-22`'s scope claim is capped, not met.** *(Superseded — carried into `risk/epics.md` RSD-8, which widens the cap to the record as well as the dashboard.)* "Scoped to the people the viewer holds Manager or People Partner access over" resolves today to Reporting line and direct People Partner. Delivery Managers and Project Managers see nothing through this dashboard until PM/AD-10 gains project traversal. Recording `PM-FR-22` as `specified` is accurate; recording it as covering its audience would not be.

**No story here is a journal or timeline event, and that is deliberate.** PM/AD-29's journal is narrow by construction and PM/AD-30's `UserEvents` tracks a fixed list. Risk records, feedback, tasks, and campaigns are none of those. Stories 1.1 and 4.1 assert this as a negative so neither model is widened into a general audit log by whoever implements them.

**Manual testing remains required for**: the §3.3.7 exception's real-world scoping across a session with mixed tiers; the S6 employee-invisibility enumeration, where the risk is an endpoint nobody thought to enumerate; campaign audience previews against realistic organisational shapes; and free-text fixture content, where NFR-2 depends on human judgement rather than a schema rule.

**Automation candidates identified**: the per-audience negative matrix over S6, S8, and S14; the cross-endpoint comparison in Story 2.3; the `leaver`/`dismissed` join check in Story 3.1; the "no second distribution path" endpoint enumeration in Story 4.3; the departure participant's idempotency proof in Story 1.4; and the filter differencing checks in Stories 2.1 and 3.5.

### Open follow-ups (not stories)

1. **Register `AC-SECTION-MATRIX-01` in `blockers.yaml`** (owner, severity, closure condition) and assign an `access-control` owner. It covers S2–S8 and S14–S16, so one registration serves this slice's S6/S8/S14 need and `PLAT-E6`. Do not stretch `AC-S9-S13`. *(The former `AC-S6-S8-S14` proposal is retired as a duplicate — 2026-09-02.)*
2. ~~**Register `ENG-E*` in PRD §0.2.**~~ **Closed 2026-09-02** — §0.2 now carries a slice table registering `PMC-E*`, `RS-E*`, and `ENG-E*`, plus the one-owning-slice-per-requirement rule.
3. **Create `_bmad-output/implementation-artifacts/engagement/sprint-status.yaml`** before any story enters a sprint.
4. **Product Owner confirmation of the nine `[DERIVED]` rules**: past-due creation (1.1); terminal lifecycle states and overdue-on-completed (1.2); activation idempotency, departed recipients, and frozen-audience immutability (2.2); closed-campaign visibility and outstanding items (2.4); same-date trend ordering and derived-not-stored trend (3.2); campaign-link metadata and post-close recording (4.3).
5. **Escalate SD-9**: S7 management notes have three normative rules, a matrix row, and a user journey, but no owning PM-FR in `PM-FR-1`–`PM-FR-42`.
6. **Correct the ratification §7 blocker counts and `QUALITY-GATE-AC` status.** The `platform-capabilities/epics.md` half is **closed 2026-09-02** — both `QUALITY-GATE-AC` and `QUALITY-GATE-AC-NFR` now read as closed there, with the NFR closure's `f89e034` resolver pin recorded. `ARCHITECTURE-RATIFICATION.md` §7 prose remains stale and is architect-owned.
7. **Run `bmad-ux` for these five FRs.** Three have no surface at all, and no Key Flow in the current spine touches any of them — despite UJ-3 and UJ-4 being entirely about this slice.
