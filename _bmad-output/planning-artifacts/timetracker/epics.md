---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - docs/project-requirements.md
  - _bmad-output/planning-artifacts/prds/prd-people-management-2026-08-24/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md
  - _bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml
  - _bmad-output/planning-artifacts/ux-designs/ux-people-management-2026-09-02/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-people-management-2026-09-02/EXPERIENCE.md
status: final
slice: timetracker
id_namespace: TT-E{epic}-S{story}
updated: 2026-09-02
---

# People Management — Timetracker Integration — Epic Breakdown

## Overview

This document is a **bounded-context slice** decomposing exactly **2 canonical PRD requirements** into implementable stories: timetracker leaves pull integration (`PM-FR-36`) and timetracker projects/people sync (`PM-FR-37`).

**Canonical requirement source:** [prd.md](../prds/prd-people-management-2026-08-24/prd.md) §5.1 — `PM-FR-*` IDs and §-refs are taken from there and from [docs/project-requirements.md](../../../docs/project-requirements.md) §5.1.

**Selection rule:** both FRs are `coverage_status: uncovered` with `stories: []` in [global-fr-epic-story-coverage.yaml](../global-coverage/global-fr-epic-story-coverage.yaml). They gate multiple downstream slices: `PMC-E3` (`PM-FR-16`/`PM-FR-17` project-grouped dashboards), `PM-FR-2` project-line audience derivation, and `PM-FR-14` sourced relationship display on profiles.

**Architecture authority:** [ARCHITECTURE-RATIFICATION.md](../architecture/architecture-people-management-ratification-2026-09-02/ARCHITECTURE-RATIFICATION.md) — `ratified-with-transition-debt`. Timetracker integration is listed in §4.2 *Confirmed absent or incomplete*.

**Blocker authority:** [blockers.yaml](../architecture/architecture-people-management-ratification-2026-09-02/blockers.yaml). Live TimeTracker gates are **`TT-IDENTITY-01`** (P0) and **`TT-PMDM-01`** (P1) only. **`TIMETRACKER-CONTRACT` is superseded historical** — it must not appear in any `gates:` list in this slice.

**UX authority (partial):** [EXPERIENCE.md](../ux-designs/ux-people-management-2026-09-02/EXPERIENCE.md) — leaves read path is demonstrated on **My time off**, **All Employees** (leave column), and **Access preview S10**. Projects/people is **column/widget display only** in the prototype. Absence calendar, leave write path, and dashboard project widgets are **not** normative for this slice unless explicitly noted.

### Cross-context boundaries

| Context | Responsibility in this slice |
|---|---|
| `timetracker` (this slice) | Inbound adapters, sync schedules, last-known snapshots, identity join implementation, sole-writer sync of `Relationship type='project'` and `managedBy:'sync'` policy rows |
| `user-management` | `User.ttId` field host, seed import keyed by timetracker identity (AD-16), profile envelope for S10/S11 read projections |
| `access-control` | Project-line audience derivation **consumes** sync output; 15-minute propagation and 4-hour withdrawal enforcement integrate here (NFR-7) |
| Platform capabilities (`PMC-E*`) | Directory leave/project columns, dashboard widgets, Access preview — **display consumers** of this slice's read models; they do not own sync |

### Identifier namespace

Stories in this slice use **`TT-E{epic}-S{story}`**.

`ACF-*`, `ACM-*`, `UMAC-*` are stable workboard identifiers and are **never** reassigned by this slice.

> **REGISTRATION:** `TT-E*` is registered in `global-fr-epic-story-coverage.yaml` `namespace_rules` and `source_slices` as part of this run. **PRD §0.2 registration remains open** — §0.2 still enumerates only `PLAT-E*`, `UM-E*`, `M-E*`, `PMC-E*`. Closing it requires a PRD amendment, exactly as `PMC-E*`, `RS-E*`, `ENG-E*`, and `FB-E*` still do.

**Out of scope for this slice:** `PM-FR-38` PeopleForce prefill (deferred); leave **write** path in platform (EXPERIENCE.md OQ-UX-01 `[PROPOSED]` only); Absence calendar surface (EXPERIENCE.md artboard exists but **not** in this slice's FR scope); manual or resourcing-driven `Relationship type='project'` writes (AD-31 forbids); inventing timetracker API endpoints (PRD FR-36: no new endpoints for bootcamp).

### Scope decisions (product owner, 2026-09-02)

- **TT-SD-1 — Pull-only for leaves.** `PM-FR-36` is read path only: S10, My time off, directory leave column. The MyLeaves "Request time off" panel in EXPERIENCE.md is **`[PROPOSED]`** beyond spec (OQ-UX-01) — no story implements it; assert the negative.
- **TT-SD-2 — Partial UX contract.** Stories bind to EXPERIENCE.md patterns for **My time off** and **directory leave column** only. Visual tokens live in `DESIGN.md`; behaviour and state patterns live in EXPERIENCE.md §Component Patterns, §State Patterns, §Key Flows (Flow 2). No new chrome is invented beyond those named patterns.
- **TT-SD-3 — Live gates only.** `TT-IDENTITY-01` and `TT-PMDM-01` are the only TimeTracker gate IDs used. `TIMETRACKER-CONTRACT` is never referenced as a live gate. `ARCH-PROJ-WRITER-01` is design-resolved (AD-31) and **implemented by** Epic 2 — it is not a separate invented gate in this slice.
- **TT-SD-4 — Epic 2 is specification-first until P0 closes.** Story creation for `PM-FR-37` is deliberate, but **no Epic 2 story may be registered in `sprint-status.yaml`, assigned, or estimated until `TT-IDENTITY-01` is closed in `blockers.yaml` and an approved durable identity source is recorded.** Epic 1 (leaves) has no TimeTracker gate and may proceed independently once slice preconditions close.
- **TT-SD-5 — Sole writer, transactional replace.** TimeTracker sync is the **only** writer of `Relationship type='project'` rows and `managedBy:'sync'` policy rows (AD-31, AD-13). Each successful sync **replaces** a user's sync-managed rows transactionally — no old+new coexistence window.
- **TT-SD-6 — Provider contract must be documented before Epic 2 closes.** PRD FR-37 requires establishing whether assignment history arrives as **events** or only **current state at sync time**. Story 2.1 records the decision in the repository before production evidence is claimed.
- **TT-SD-7 — Access freshness is security input, not display polish.** The 15-minute propagation bound and 4-hour withdrawal on failed sync (requirements §5.1, NFR-7) apply to **project-derived access**, not merely to widget timestamps. The stale banner must be visible (requirements §5.1).

### Slice-level preconditions

| Precondition | Severity / status | Why it precedes every epic |
|---|---|---|
| Seeded population import | **required** | AD-16: users enter via idempotent import keyed by timetracker identity; leave/project sync applies to that population (requirements §4.17, §5.1) |
| S10 facade support | **implemented (kernel)** | `AccessControlFacade` supports S1/S10/S11 in ACM-5; S10 read projection still needs leave data from this slice |
| `TT-IDENTITY-01` | **P0 open** | Blocks Epic 2 only — no legitimate `Relationship type='project'` row without approved identity join |
| `TT-PMDM-01` | **P1 open** | Blocks Epic 2 Story 2.3 production evidence — PM/DM edges cannot join on display name |
| `SEC-AUTH-01` | **P0 open** | Interim target-auth permits every operation on every target; access-freshness stories inherit the hole. *(2026-09-03 correct-course note: implementation evidence exists on the unmerged `dn-um-implementation` branch — see `blockers.yaml` `status_note`. Not yet merged or independently verified; this precondition stays open.)* |
| Timetracker test environment | **external** | TT-Bootcamp Data per requirements §5.1; seeded user list delivered 26 August |

Owner for sync adapters and identity join: **`timetracker`** (new bounded context — confirm layout before sprint entry, same pattern as `resourcing`/`action-items`). Owner for access-freshness integration: **`access-control`**. Owner for profile/directory read projections: **`user-management`** and **`PMC-E1`** consumers respectively.

### Unblocks (downstream, not dependencies of this slice)

| Consumer | What this slice supplies |
|---|---|
| `PMC-E3` / `PM-FR-16`, `PM-FR-17` | Project-grouped dashboard data and project-scoped request visibility |
| `PM-FR-2` | Project-line audience derivation via sync-written membership |
| `PM-FR-14` | Sourced manager/PP/project relationships on profile and Access preview |
| `PMC-E1` / `PMC-E2` | Directory project column and leave status column; dashboard widgets exit degraded state |

## Requirements Inventory

### Functional Requirements

Exactly 2, verbatim-sourced from PRD §5.1 and requirements §5.1.

- **PM-FR-36** *[PRD §5.1 FR-36]*: Pull leave types, dates, and status for S10 display and self-service link-out to manage leaves in timetracker. Scope confirmed: one of two timetracker APIs. No new timetracker endpoints for bootcamp.
  - Consequence: read path only — platform does not approve or mutate leave records.
  - Consequence: colleague audience sees S10 **dates only**, leave type hidden (requirements §3.3 rule 4).
- **PM-FR-37** *[PRD §5.1 FR-37]*: Pull projects, assignments, PM, and DM mappings. Project assignment feeds project-line resolution (§2.1). Sync is sole writer of sync-managed policy rows.
  - Consequence: project assignment changes affect access within **15 minutes**.
  - Consequence: during outage, app remains available with last-known data behind a **visible stale-data banner**; after **four hours** of failed sync, all project-derived access is withdrawn.
  - Consequence: before implementation closes, document whether assignment history is events or state-at-sync-time.
  - Consequence: prod timetracker project duplication is operations concern, not bootcamp blocker.

### NonFunctional Requirements

From PRD §8, filtered to what binds this slice.

- **NFR-1** *[PRD §8 NFR-1]*: Access-control correctness is primary. Project assignment is security input (requirements §5.1). Wrong membership or stale project access beyond the documented window is a critical defect.
- **NFR-2** *[PRD §8 NFR-2]*: Seeded test population only; no real PII in fixtures, logs, or agent contexts.
- **NFR-4** *[PRD §8 NFR-4]*: External integration failures degrade gracefully; timetracker outage must not take down core application (requirements §5.1, §7).
- **NFR-6** *[PRD §8 NFR-6]*: English UI only.
- **NFR-7** *[PRD §8 NFR-7]*: Project-derived access changes within 15 minutes; withdrawn after 4 hours of failed sync. Functional-permission revocation remains immediate on platform-owned grants.

**Not claimed here:** **NFR-3** (2s at 500+ directory rows) — owned by `PMC-E1`; this slice supplies derived fields only.

**Not claimed here:** **NFR-5** — responsive/a11y for My time off inherits EXPERIENCE.md §Accessibility Floor; directory column inherits `PMC-E1` table patterns.

### Additional Requirements

**Architecture (binding)**

- **AD-13:** `User.ttId` exists from day one; when timetracker lands, sync is sole writer of `managedBy:'sync'` rows with transactional replace.
- **AD-31:** TimeTracker sync is sole writer of `Relationship type='project'`. Manual admin, HR Admin, and resourcing fulfilment must not write those rows.
- **AD-16:** Seed import keyed by external timetracker identity; timetracker is not an employment-state writer.
- **AD-14:** Leaves collection at `GET /users/:id/leaves` (read-only host under user-management HTTP adapter).
- **AD-15:** No fake standing in for this slice's own deliverables in production path (SM-C2: mock integration permanence is failure).
- **PM/AD-24:** HTTP denial oracle — `401` / `404` hidden target / `403` forbidden; lists omit invisible rows.

**Integration facts (requirements §5.1)**

- Two APIs: (1) Leaves, (2) Projects and people.
- Documentation: TT-Bootcamp Data (SharePoint link in requirements §5.1).
- Freshness is an **access-control window**, not display-freshness only.

### UX Design Requirements

**Partial — EXPERIENCE.md binds leaves surfaces only (TT-SD-2).** Project column/widget display is referenced for consumer alignment; implementation of those columns remains in `PMC-E*`.

Extracted from EXPERIENCE.md for in-scope surfaces:

- **TT-DR1:** **My time off** (`MyLeaves.dc.html`) — Workspace → My time off. Upcoming/Past tabs; type, dates, working days, status from timetracker; footer link-out to manage in timetracker. **No balances in platform.** Page header uses `.pghd` with `{colors.stretch-amber}` accent and `.prov` tag variant **SYNCED**.
- **TT-DR2:** **Stale sync banner** on My time off (and shared contract for project surfaces) — amber banner with last sync time; explains paused refresh and 4h project-access fallback per architecture (EXPERIENCE.md §State Patterns). Assertive for screen readers.
- **TT-DR3:** **Directory leave status column** on All Employees — synced away dates with page-level provenance "Synced · leave & projects" (EXPERIENCE.md Flow 3). Colleague view omits non-whitelist columns per existing PMC contract — leave column visibility follows entitlement, not client-side hide.
- **TT-DR4:** **S10 on profile / Access preview** — leaves read table; Colleague audience: dates only, type hidden (EXPERIENCE.md §State Patterns `S10 colleague narrowing`). Section omitted entirely when entitlement is `none` — server omission, not UI hide.
- **TT-DR5:** **Banned:** client-side section hiding as substitute for server omission; presenting zero-valued or fabricated leave/project data as real when sync is absent; implementing `[PROPOSED]` Request time off panel (OQ-UX-01).

**UX gaps recorded, not resolved:** Absence calendar (`TeamCalendar.dc.html`) has artboard coverage for `PM-FR-36‡` but is **out of this slice** per product-owner scope. Dashboard project widgets and Access preview project header remain `PMC-E*` display consumers.

## FR Coverage Map

| Requirement | Epic | Stories |
|---|---|---|
| `PM-FR-36` | Epic 1 | TT-E1-S1.1, TT-E1-S1.2, TT-E1-S1.3, TT-E1-S1.4 |
| `PM-FR-37` | Epic 2 | TT-E2-S2.1, TT-E2-S2.2, TT-E2-S2.3, TT-E2-S2.4 |

## Epic List

### Epic 1: Leaves Integration (Read Path)

Employees and managers see synced leave records on profile S10, the My time off workspace, and the directory leave column; timetracker outage degrades gracefully without taking down the application.

**FRs covered:** `PM-FR-36`

**Audience:** Self (My time off, own S10); managers and entitled viewers (directory column, others' S10 per matrix); Colleague tier sees dates only on S10.

**Standalone:** yes — does not require Epic 2. Does not unblock project-line access.

**NFRs engaged:** NFR-1 (S10 entitlement), NFR-2, NFR-4, NFR-6

**UX-DRs covered:** TT-DR1, TT-DR2, TT-DR3, TT-DR4, TT-DR5

### Epic 2: Projects and People Sync

TimeTracker sync is the sole writer of project membership and sync-managed PM/DM policy rows; project-derived access propagates within 15 minutes and withdraws after four hours of failed sync.

**FRs covered:** `PM-FR-37`

**Audience:** All project-line audiences (DM, PM) — indirect via access-control; display consumers via read models.

**Standalone:** yes in specification, **not sprint-startable** until `TT-IDENTITY-01` closes (TT-SD-4).

**Enables:** `PM-FR-2` project-line, `PM-FR-14`, `PMC-E3` (`PM-FR-16`/`PM-FR-17`), directory project column, dashboard project widgets.

**NFRs engaged:** NFR-1, NFR-2, NFR-4, NFR-7

**Blocking gates:** `TT-IDENTITY-01` (P0, hard sprint-entry block), `TT-PMDM-01` (P1, Story 2.3 production evidence)

### Epic Dependency Graph

- Slice-level preconditions → **all epics**
- Epic 1 (leaves) — **no dependency on Epic 2**
- `TT-IDENTITY-01` → **Epic 2 only** (hard NOT-STARTABLE until closed)
- Epic 2 (project sync) → downstream `PMC-E3`, `PM-FR-2` project-line, `PM-FR-14` (consumers, not blockers of Epic 1)

---

## Epic 1: Leaves Integration (Read Path)

**Status:** backlog

Employees and managers see synced leave records on profile S10, the My time off workspace, and the directory leave column; timetracker outage degrades gracefully without taking down the application.

**FRs covered:** `PM-FR-36`
**NFRs engaged:** NFR-1, NFR-2, NFR-4, NFR-6
**UX-DRs covered:** TT-DR1–TT-DR5

### Story 1.1: Leaves inbound adapter and periodic sync

**ID:** `TT-E1-S1.1` · **Sprint key:** `1-1-leaves-inbound-adapter-and-periodic-sync`

As the platform,
I want to pull leave types, dates, working days, and status from the timetracker leaves API on a schedule,
So that leave data is available for S10, My time off, and directory projections for the seeded population.

**Gates:** Seeded population import complete; timetracker test environment reachable.

**Acceptance Criteria:**

**Given** a seeded platform user linked to a timetracker identity per AD-16
**When** the leaves sync job runs successfully against the timetracker test API
**Then** leave records for that user are persisted with type, start date, end date, working days, and status
**And** a `lastSuccessfulSyncAt` timestamp is recorded for the leaves feed

**Given** the timetracker leaves API returns multiple leave types (vacation, sick, parental, extended)
**When** sync persists them
**Then** each record retains its timetracker type identifier and display label for entitled audiences
**And** no platform endpoint mutates timetracker leave state (pull-only, PM-FR-36)

**Given** a user exists in the platform but has no matching timetracker identity
**When** leaves sync runs
**Then** that user has zero leave rows from sync
**And** no error fails the entire job (per-user skip with structured log, NFR-2 safe)

**Given** AD-15
**When** this story is considered done
**Then** production path uses a real timetracker HTTP adapter — not a permanent mock (SM-C2)

### Story 1.2: S10 leaves read projection on profile

**ID:** `TT-E1-S1.2` · **Sprint key:** `1-2-s10-leaves-read-projection-on-profile`

As a viewer entitled to S10 on an employee profile,
I want to read synced leave records through the profile API,
So that leave visibility follows the §3.2 matrix including colleague narrowing.

**Gates:** TT-E1-S1.1 (leave rows exist); S10 kernel in `access-control` (ACM-5).

**Acceptance Criteria:**

**Given** employee Eve has synced upcoming and past leave rows
**When** Eve (Self) calls `GET /users/:eveId` and S10 is entitled
**Then** the response includes an S10 section with type, dates, working days, and status
**And** a link-out URL to manage leaves in timetracker is present (PM-FR-36, TT-DR1)

**Given** the same leave rows
**When** a Colleague-tier viewer calls the profile endpoint
**Then** S10 includes date ranges only
**And** leave type is **absent** from the payload (requirements §3.3 rule 4, TT-DR4)

**Given** a viewer with no S10 entitlement
**When** they call the profile endpoint
**Then** S10 is **omitted** from the response — not returned empty, not returned with hidden fields (TT-DR5)

**Given** Eve has no synced leave rows
**When** an entitled viewer calls the endpoint
**Then** S10 is present as an empty collection or omitted per existing section-empty convention — never fabricated placeholder leaves

**Given** Access preview (HR Admin)
**When** audience segment changes to Colleague
**Then** S10 narrowing matches the profile behaviour (EXPERIENCE.md Flow 1 step 5)

### Story 1.3: My time off workspace surface

**ID:** `TT-E1-S1.3` · **Sprint key:** `1-3-my-time-off-workspace-surface`

As an employee,
I want a My time off page listing my upcoming and past leave from timetracker,
So that I can see what the platform knows and link out to timetracker to make changes.

**Gates:** TT-E1-S1.1; TT-E1-S1.2 (API contract stable).

**Acceptance Criteria:**

**Given** I am authenticated as Self
**When** I open Workspace → My time off
**Then** the page renders per TT-DR1: `.pghd` header with SYNCED provenance tag, Upcoming and Past tabs, and rows showing type, dates, working days, status
**And** a footer link opens timetracker for leave management (EXPERIENCE.md Flow 2)

**Given** the page loads
**When** leave balances are not provided by timetracker
**Then** no balance widgets are shown
**And** copy does not imply the platform owns approval workflow (TT-DR5)

**Given** the `[PROPOSED]` Request time off panel in the prototype
**When** the page is inspected
**Then** no in-platform leave request or approval control exists (OQ-UX-01 negative, TT-SD-1)

**Given** NFR-6
**When** the surface is rendered
**Then** all user-visible strings are English

### Story 1.4: Directory leave column and leaves graceful degradation

**ID:** `TT-E1-S1.4` · **Sprint key:** `1-4-directory-leave-column-and-leaves-graceful-degradation`

As a Unit Manager scanning my unit in All Employees,
I want a leave status column sourced from timetracker,
So that I can see who is away without opening each profile.

As any user on leave surfaces,
I want the application to remain usable when timetracker is down,
So that a sync outage does not take down core functionality.

**Gates:** TT-E1-S1.1; `PMC-E1` directory projection consumer contract (column slot exists).

**Acceptance Criteria:**

**Given** synced leave data for users in a manager's scope
**When** the manager loads All Employees with the leave status column enabled
**Then** each row shows current or next relevant away state derived from last successful sync (TT-DR3)
**And** the page header provenance tag indicates timetracker-sourced leave data where EXPERIENCE.md requires it

**Given** Colleague view is active on the directory
**When** the leave column is evaluated
**Then** column visibility follows server-assembled column whitelist — not client-side column hide (TT-DR5)

**Given** timetracker leaves API is unreachable
**When** a user opens My time off or a profile S10 section
**Then** the application returns **200** with last-known leave data where any exists
**And** an amber stale banner is visible with last sync timestamp (TT-DR2, NFR-4)
**And** core navigation and non-leave features continue to work

**Given** timetracker has never successfully synced for a user
**When** leave surfaces load
**Then** an explicit empty or unavailable state is shown — never fabricated dates (TT-DR5, PMC SD-2 honesty pattern)

**Given** a timetracker outage
**When** the outage persists
**Then** leaves read surfaces continue to serve last-known data indefinitely
**And** the 4-hour project-access withdrawal rule from requirements §5.1 does **not** apply to leaves display (NFR-7 scope is project-derived access — Epic 2)

---

## Epic 2: Projects and People Sync

**Status:** backlog — **NOT STARTABLE** until `TT-IDENTITY-01` closes (TT-SD-4)

> **Binding rule:** no story in this epic may be registered in `sprint-status.yaml`, assigned, or estimated until `TT-IDENTITY-01` is closed in `blockers.yaml` **and** an approved durable identity source is recorded. An epic number is not a schedule.

TimeTracker sync is the sole writer of project membership and sync-managed PM/DM policy rows; project-derived access propagates within 15 minutes and withdraws after four hours of failed sync.

**FRs covered:** `PM-FR-37`
**NFRs engaged:** NFR-1, NFR-2, NFR-4, NFR-7
**Blocking gates:** `TT-IDENTITY-01` (P0), `TT-PMDM-01` (P1 on Story 2.3)

### Story 2.1: Durable member identity join and User.ttId population

**ID:** `TT-E2-S2.1` · **Sprint key:** `2-1-durable-member-identity-join-and-user-ttid-population`

As the integration owner,
I want an approved durable identity mapping from timetracker project members to platform users,
So that `User.ttId` is populated and project membership rows can be written legitimately.

**Gates:** `TT-IDENTITY-01` (**must be closed before sprint entry**); timetracker projects/people API documentation reviewed.

**Acceptance Criteria:**

**Given** `TT-IDENTITY-01` is open
**When** this story is evaluated for scheduling
**Then** it is **blocked** — specification and spike work only, no production membership writes

**Given** an approved identity decision is recorded (closure of `TT-IDENTITY-01`)
**When** project member sync encounters `AccountTalentDto {email, dateStart, dateEnd}` or successor shape
**Then** each member resolves to exactly one platform `User` via the approved durable key
**And** `User.ttId` is populated or updated idempotently (AD-13)

**Given** a timetracker member that cannot be resolved to a seeded platform user
**When** sync runs
**Then** no `Relationship type='project'` row is created for that member
**And** the skip is logged without failing the entire sync job

**Given** PRD FR-37 and TT-SD-6
**When** this story closes
**Then** repository documentation states whether assignment history is available as **events** or **state-at-sync-time only**
**And** the answer is referenced from sync and audit design notes

**Given** requirements §6 ("email alone is insufficient")
**When** identity join is implemented
**Then** no production path relies on email alone as the sole durable key unless an explicit approved amendment to AD-13 exists

### Story 2.2: Project membership sync as sole Relationship writer

**ID:** `TT-E2-S2.2` · **Sprint key:** `2-2-project-membership-sync-as-sole-relationship-writer`

As the platform,
I want timetracker sync to be the only writer of `Relationship type='project'` rows,
So that project membership reflects timetracker assignments without manual or resourcing drift.

**Gates:** TT-E2-S2.1 (identity join approved and implemented); `TT-IDENTITY-01` closed.

**Acceptance Criteria:**

**Given** a successful projects/people sync for user U on project P
**When** membership is applied
**Then** `Relationship {type:'project', userId:U, projectId:P}` exists
**And** no manual admin, HR Admin, or resourcing fulfilment path can insert, update, or delete that row (AD-31, TT-SD-5)

**Given** user U was on project P and timetracker no longer lists them
**When** the next successful sync runs
**Then** the `Relationship type='project'` row for (U, P) is removed
**And** removal participates in the same transactional replace as additions — no stale coexistence window (AD-13)

**Given** resourcing request approval (RS slice)
**When** a candidate is approved
**Then** no `Relationship type='project'` row is written by resourcing
**And** membership appears only after sync reflects timetracker state (RS SD-3)

**Given** a negative test over admin and resourcing HTTP routes
**When** a caller attempts to write `Relationship type='project'`
**Then** the route returns `403` or is absent — never `200` (AD-31)

### Story 2.3: Sync-managed PM and DM policy materialization

**ID:** `TT-E2-S2.3` · **Sprint key:** `2-3-sync-managed-pm-and-dm-policy-materialization`

As the platform,
I want PM and DM assignments from timetracker materialized as sync-managed policy rows,
So that project-line audience derivation has correct managerial edges.

**Gates:** TT-E2-S2.2; `TT-PMDM-01` (**must be closed for production evidence**).

**Acceptance Criteria:**

**Given** timetracker reports `projectManager` and `deliveryManager` for project P
**When** sync runs with `TT-PMDM-01` closed and an approved resolvable identifier
**Then** `managedBy:'sync'` policy rows attach the correct platform users as PM and DM for P
**And** rows are replaced transactionally per sync — no old+new coexistence (AD-13)

**Given** `TT-PMDM-01` is open and only display-name strings are available
**When** this story is evaluated for production evidence
**Then** evidence is **resolver proof or specification only** — not capability proof
**And** the story documents the fail-open risk explicitly (blockers.yaml TT-PMDM-01 note)

**Given** a PM or DM timetracker value that does not resolve to a platform user
**When** sync runs
**Then** no policy row is created on an unresolved string
**And** access does not widen via guessed name match (NFR-1)

**Given** project-line audience resolution (consumer in `access-control`)
**When** sync-managed PM/DM rows exist
**Then** DM and PM functional roles gain project-line tier only over members of their synced projects (feeds `PM-FR-2`, `PM-FR-14`)

### Story 2.4: Access freshness — 15-minute propagation and 4-hour withdrawal

**ID:** `TT-E2-S2.4` · **Sprint key:** `2-4-access-freshness-15-minute-propagation-and-4-hour-withdrawal`

As a security stakeholder,
I want project-derived access to reflect timetracker within 15 minutes and withdraw after four hours of failed sync,
So that the platform's access guarantees match requirements §5.1 and NFR-7.

**Gates:** TT-E2-S2.2, TT-E2-S2.3; `SEC-AUTH-01` (production evidence caveat).

**Acceptance Criteria:**

**Given** a project assignment change in timetracker at time T
**When** sync succeeds at or before T+15 minutes
**Then** project-line access for the affected user matches the new assignment on the next authorization request after sync
**And** documentation labels this as an **access guarantee**, not display freshness only (TT-SD-7)

**Given** timetracker projects/people sync has failed continuously for less than 4 hours
**When** a viewer requests project-line access
**Then** last-known project-derived access is still evaluated
**And** a visible stale-data banner is present on surfaces that show timetracker-sourced project data (TT-DR2, requirements §5.1)

**Given** timetracker projects/people sync has failed continuously for 4 hours or more
**When** a viewer requests project-line access
**Then** all project-derived access is withdrawn
**And** platform-owned relationships (reporting line, direct PP, functional permissions) continue to apply unchanged (NFR-7)

**Given** an outage inside the 4-hour window
**When** access is evaluated
**Then** the platform may serve access that no longer exists in timetracker — the documented deliberate trade-off
**And** the banner states data may be stale — never decorative (requirements §5.1)

**Given** timetracker is unreachable
**When** any core page loads
**Then** the application does not hard-fail or return 503 for non-integration routes (NFR-4)

**Given** automated tests
**When** propagation and withdrawal criteria are exercised
**Then** tests use controlled sync timestamps — not wall-clock sleeps in CI

---

## Step 4 Validation Summary

| Check | Result |
|---|---|
| Every in-scope PM-FR has ≥1 story | **PASS** — PM-FR-36, PM-FR-37 mapped |
| Stories have namespaced IDs | **PASS** — `TT-E1-S*`, `TT-E2-S*` |
| No invented `TIMETRACKER-CONTRACT` gate | **PASS** — TT-SD-3; only `TT-IDENTITY-01`, `TT-PMDM-01` |
| Leaves scope matches owner direction | **PASS** — S10, My time off, directory column; no write path |
| Epic 2 blocked on P0 | **PASS** — TT-SD-4 NOT STARTABLE rule |
| AD-31 sole writer enforced | **PASS** — Stories 2.2, 2.3 negatives |
| NFR-4 and NFR-7 bound | **PASS** — Stories 1.4, 2.4 |
| UX partial contract referenced | **PASS** — TT-DR1–5 from EXPERIENCE.md |
| Downstream unblocks documented | **PASS** — PMC-E3, PM-FR-2, PM-FR-14 |
| Registration recorded | **PASS** — `TT-E*` registered in coverage model |

**Open follow-ups (not stories):**

1. Register `TT-E*` in PRD §0.2 (same class as `RS-E*`, `ENG-E*`).
2. Create `_bmad-output/implementation-artifacts/timetracker/sprint-status.yaml` before sprint entry.
3. Confirm `src/timetracker/` bounded-context layout (AD-5 pattern) before Epic 1 enters a sprint.
4. Close `TT-IDENTITY-01` before any Epic 2 sprint registration.
5. `bmad-ux` extension for Absence calendar if product expands `PM-FR-36` surface scope beyond this slice.
