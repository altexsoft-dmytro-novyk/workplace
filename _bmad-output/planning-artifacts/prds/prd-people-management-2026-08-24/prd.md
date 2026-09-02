---
title: People Management Platform
status: canonical
created: 2026-08-24
updated: 2026-09-02
normative_source: docs/project-requirements.md@v1.5
rebaseline: sprint-change-proposal-2026-09-02-people-management-rebaseline.md
---

# PRD: People Management Platform

## 0. Document Purpose

This PRD defines the **People Management Platform** for an internal engineering organisation (~500 employees). It is the single canonical product interpretation for Team 7 (Lazy Load) in the AI-native SDLC Bootcamp 2.0 and the binding product-level scope reference for UX, architecture, epics, domain specs, and test design.

**Structure:** Glossary-anchored vocabulary; features grouped with globally numbered functional requirements (FR-N); assumptions tagged inline and indexed in §12.

**Existing inputs this PRD builds on (does not duplicate):**

| Artifact | Role |
|----------|------|
| `docs/project-requirements.md` v1.5 | Primary functional and normative scope |
| `_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md` | Architectural invariants and deferred topics |
| `docs/architecture/access-control.md` | Access-control binding rules |
| `AI SLDC Bootcamp 2.0 Resources/Decision Log.md` *(external)* | Confirmed `DEC-*` decisions |
| `AI SLDC Bootcamp 2.0 Resources/Open Questions.md` *(external)* | Unresolved `OQ-*` gaps |
| Market landscape research (2026) | Strategic positioning — see `addendum.md` |

Technical implementation choices belong in `addendum.md` and downstream architecture — not in this document.

**Source authority:** `docs/project-requirements.md` v1.5 is normative. Earlier decisions remain valid only where they do not contradict v1.5. The approved CC-02 Option 1 decision additionally defines how multiple simultaneously applicable access audiences combine; unresolved CC decisions remain explicit implementation gates in §11.

### 0.1 Authority hierarchy

1. `docs/project-requirements.md` v1.5 is the upstream normative assignment and grading source.
2. This document is the canonical product PRD: it owns product FRs, journeys, MVP scope, NFRs, open product decisions, and product-level traceability.
3. Approved architecture decisions and Correct Course proposals constrain implementation only within their stated scope; unresolved decisions remain gates.
4. Domain specs decompose this PRD for a bounded context. They may add testable implementation detail but may not redefine product behavior.
5. Epics, stories, compiled specs, test designs, and sprint trackers are downstream delivery artifacts.

### 0.2 Historical records and identifier namespaces

The former User Management and Mentorship PRDs are preserved unchanged as dated historical records. Their detail is carried forward through:

- `_bmad-output/specs/spec-user-management-domain/SPEC.md`
- `_bmad-output/specs/spec-mentorship-domain/SPEC.md`

Existing epic files remain immutable bounded-context slices. The global cross-product rollup is `_bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml`.

Identifiers are always namespaced outside their source document:

- `PM-FR-*` — canonical product requirements in this PRD.
- `UM-FR-*` — historical User Management requirement aliases.
- `M-FR-*` — historical Mentorship requirement aliases.
- `PLAT-E*`, `UM-E*`, `M-E*` — context-qualified epic and story identifiers.
- `ACF-*`, `ACM-*`, `UMAC-*` — stable workboard identifiers; never reassigned.

### 0.3 Delivery status vocabulary

Requirement coverage uses six evidence-based states:

- `implemented` — shipped behavior with implementation evidence.
- `in-progress` — active implementation or review.
- `specified` — a current story/spec exists but implementation is not active.
- `deferred` — explicitly gated or outside the current delivery slice.
- `superseded` — historical pointer retained for traceability.
- `uncovered` — normative product behavior has no current delivery story.

These states describe delivery evidence, not product priority or approval. A mapped requirement is not necessarily implemented.

---

## 1. Vision

The organisation needs a single place to understand, develop, and allocate its people — profiles, risks, development records, and resourcing — with confidence that sensitive data reaches only the audiences entitled to see it.

The People Management Platform replaces ad hoc spreadsheets and fragmented tools with a web application where **every profile is decomposed into sections**, each governed by an explicit access matrix. Managers, delivery leads, and people partners work from role-appropriate dashboards; employees maintain their own contact and development data; resourcing flows connect unit managers, delivery managers, and project managers without leaking profile data across trust boundaries.

For this bootcamp iteration, **demonstrating a spec-driven, parallel, AI-native delivery process is co-equal with shipping working software**. Access-control correctness is the primary quality attribute — a leak in any section, API surface, export, or notification path is a critical defect.

### 1.1 Why build (strategic context)

Market and requirements analysis confirms this is **not a conventional HRIS purchase decision**. The target combines four categories normally sold separately: core employee data, talent/development workflows, engineering resourcing, and **relationship-aware authorization**. No reviewed commercial product publicly demonstrates the full normative access matrix (dual reporting + project graphs, section-level assembly, S7 PM exception, visibility-safe filtering, expiring profile shares).

**Recommended pattern (Pattern E — composable platform):**

1. **Build** the policy engine, profile aggregation, resourcing state machine, and authorization regression tests.
2. **Integrate** internal timetracker (required — leaves + projects/people, load-bearing for permissions). PeopleForce optional prefill only (§5.2).
3. **Use** enterprise and mid-market products (Workday, Kantata, HiBob, etc.) as **process and UX benchmarks**, not replacements.

The machine-readable access matrix and its negative test catalogue are **deliverables**, not afterthoughts (SM-1, AD-1). Full market research: see addendum.

---

## 2. Target User

### 2.1 Jobs To Be Done

**Employees**

- See and maintain my own profile data (contacts, photo, certificates, mentorship status) without waiting on HR.
- Understand my projects, leaves, development plan, and feedback explicitly shared with me.
- Complete action items and form tasks assigned to me.

**Managers (Unit Manager, Delivery Manager, Project Manager)**

- See the people I am responsible for with the correct audience-specific view: Reporting line for reports-to and department management, and the narrower Project line for project-derived responsibility.
- Track risks, action items, and resourcing for my unit or projects from a dashboard suited to how I organise work (by people or by project).
- Propose candidates, share limited profile views for evaluation, and record management notes with appropriate visibility.

**People Partner**

- Maintain HR-facing profile sections, career timeline, CDS records, feedback, and campaigns for assigned employees.
- Run form campaigns to collect structured input without building forms inside the platform.

**HR Admin**

- Define custom fields, system dictionaries, and extensible functional roles — without developer involvement.
- Govern who holds which functional capabilities across the organisation (**configuration only in v1 — DEC-108**).

**Organisation (implicit)**

- Trust that personal and management-only data never appears to colleagues, employees, or authenticated viewers outside the resolved access tier.

### 2.2 Non-Users (v1)

- **External/anonymous viewers** — shared profile links require authenticated platform users (**DEC-101**).
- **Candidates pre-hire** — pre-onboarding profile creation is out of scope (§10 of test assignment).
- **Payroll / compensation stakeholders** — no compensation data in v1.
- **LMS consumers** — learning management is a separate track.

### 2.3 Key User Journeys

**UJ-1. Carlos (DM) evaluates a proposed candidate for an open resourcing request.**

Carlos, Delivery Manager for two active projects, is authenticated on the web app. From his delivery dashboard he opens a resourcing request he created, sees candidates proposed by a Unit Manager. For an internal employee he lacks reporting-line access to, he follows a profile-sharing link — logs in as the named recipient, sees only the sections enabled, and approves or rejects with written feedback. For an external candidate, he uses stored candidate ID data or an external PeopleForce link if integrated.

**UJ-2. Tamar (employee) updates emergency contacts without HR.**

Tamar opens self-service, navigates to personal and emergency contacts (S2, S3), edits values inline, and saves. She cannot see her risk level (S6) or management notes not flagged visible-for-employee (S7). Her manager sees the updated emergency contacts on next profile load with read access per the matrix.

**UJ-3. Anna (PP) launches a security-awareness form campaign.**

Anna builds an audience filter on All Employees (e.g., all engineers in Poland who joined this year), previews the recipient list, creates a campaign linking to an external Microsoft Form, sets a due date, and activates. Each recipient receives an action item (S14). Anna monitors completion on the campaign page; overdue items highlight automatically. She does not gain resourcing features — PP functional role excludes them.

**UJ-4. Dmytro (UM) triages unit risks from the risk dashboard.**

Dmytro opens the risk dashboard scoped to people in his reporting line, filters by project, sorts by severity, drills into a high-risk employee's profile S6, adds a management note (invisible to the employee by default), and creates an action item with a due date. The employee never receives indication of the risk record.

---

## 3. Glossary

| Term | Definition |
|------|------------|
| **Access role** | Computed relationship tier: Self, Reporting line, Project line, People Partner, Colleague. Derived from reports-to, department management, and project assignment (§2.1). |
| **Functional role** | Assigned capability bundle (UM, DM, PM, PP, HR Admin, or runtime-defined). Governs *features*, not data visibility (§2.2–2.3). |
| **HR Admin** | Functional role for system configuration: roles, permissions, custom fields, dictionaries, departments. No default employee-data access (§2.2, §2.4). |
| **Department** | Org entity: an employee belongs to one or more departments; departments nest (§4.17). |
| **Section (S1–S16)** | Atomic profile partition with its own access matrix cell per audience. |
| **Reporting line** | Transitive closure of reports-to and department-management relationships (§2.1). |
| **Project line** | Access from project assignment only — narrower §3.2 cells (§3.3.2). |
| **Full-profile access** | Separate §2.4 grant that permits reading every profile section; it is not a functional role and grants no blanket write authority. |
| **Relationship and grant journal** | Narrow security journal for changes that alter who can see what, plus shared-link accesses (§3.4). |
| **Employment status** | Time-bounded `active` or `dismissed` fact; the sole source for whether a person has departed (§4.16). |
| **Tier** | Resolved access role of a viewer with respect to a specific target employee. |
| **Policy attachment** | Data record linking a user to a managerial or functional capability scope. [ASSUMPTION: implementation uses unified policy model per architecture spine — see addendum.] |
| **Action item** | Single task entity: manual or campaign-generated; lifecycle open → completed (assignee) or cancelled (author with reason). Effective departure cancels only open items assigned to the departing person. |
| **Form campaign** | Audience-selected distribution of external form links as action items. |
| **CDS** | Career Development System registry — links to external matrix/assessment files, conclusions, and IDP completion; does not host assessments. |
| **Shared link** | Time-limited, revocable, read-only profile view for authenticated users without reporting-line, project-line, or PP access over the subject. |
| **Colleague view** | Whitelist visibility: S1, S10 (dates only), S11 (project name only). |

---

## 4. Features

### 4.0 Bounded-context ownership

| Context | Product responsibility | Canonical FRs | Domain/decomposition authority |
|---|---|---|---|
| `access-control` | Access audiences, section decisions, functional permission evaluation, full-profile overlay | PM-FR-1–7, PM-FR-39–40 | Approved Access Control architecture/spec packages |
| `user-management` | Seeded identity, authentication, profile identity, career events, organisational mutations, employment lifecycle, Access Control adoption | PM-FR-12–14, PM-FR-28–29, PM-FR-41–42 (partial) | `spec-user-management-domain/SPEC.md` |
| `mentorship` | Availability, pair lifecycle, pool/read surfaces, cross-context effects | PM-FR-32–34 | `spec-mentorship-domain/SPEC.md` |
| Platform capabilities | Directory, dashboards, action items, campaigns, risks, resourcing, sharing, CDS, feedback | PM-FR-8–11, PM-FR-15–27, PM-FR-30–31, PM-FR-35 | Future capability specs and global coverage model |
| Timetracker integration | Leaves, projects/people, access freshness | PM-FR-36–37 | Future integration contract |

Ownership does not imply implementation completeness. Current evidence and gaps are recorded in the global coverage model and architecture ratification package.

### 4.1 Access Control and Role Model

**Description:** The platform enforces two independent role dimensions on every request. Access roles determine section visibility; functional roles determine feature availability. Functional roles never widen data access beyond the viewer's computed tier. All section checks run server-side; absent sections are omitted from API responses, exports, search, and notifications — not merely hidden in UI.

**Functional Requirements:**

#### FR-1: Two-dimensional role model

The system maintains **access roles** (derived) and **functional roles** (assigned) as separate dimensions. No single role list collapses both.

**Consequences (testable):**
- Assigning DM functional role alone does not grant reporting-line or project-line tier over employees outside the viewer's scope.
- A user may hold Manager tier over employee A, People Partner tier over B, and Colleague tier over C in one session.

#### FR-2: Transitive reporting-line and project-line resolution

Manager access arises from (a) reports-to, (b) department management, and (c) project assignment where the viewer is PM or DM of a project the subject works on. Reporting line and project line are distinct matrix audiences.

**Consequences (testable):**
- Platform-owned relationship changes — manager, People Partner, employee department, and department manager — affect access on the next request.
- Project-assignment changes affect access within 15 minutes. During timetracker failure, last-known project data is served behind a visible stale-data banner and all project-derived access is withdrawn after four hours.
- DM and PM see project members through the narrower Project-line matrix column, not at the same data level as the subject's Reporting line.
- PM sees project members; DM above PM sees PM's project scope plus remaining projects.
- People Partner access extends recursively through the assigned PP's own reports-to chain inside HR, never through the employee's delivery chain.

#### FR-3: Section-level access matrix

For each profile section S1–S16, the system enforces the normative matrix (Self / Reporting line / Project line / PP / Colleague / Shared link) with permissions RW, R, —, or cfg as specified.

**Consequences (testable):**
- Every `—` cell: section absent from UI, API payload, export, search results, error messages, and notifications for that audience.
- S7 management notes default invisible to employee and PM; PM reads only notes flagged visible-for-PM; employee reads only notes flagged visible-for-employee.
- Colleague view returns exactly S1, S10 (dates only), S11 (project name only) — enforced server-side.
- HR Admin is not a matrix audience; full profile access is a separate grant (§2.4).
- When more than one relationship-derived audience applies, effective access uses the strongest applicable permission per section (`RW` > `R` > `—`), as approved in CC-02 Option 1. This rule never manufactures a functional permission and never bypasses a dedicated mutation gate.

#### FR-4: Server-side assembly on every request

Profile and list responses are assembled from entitled sections only, after live tier resolution per target employee.

**Consequences (testable):**
- Negative tests exist for every `—` matrix cell, every audience, and representative relationship paths (Definition of Done §9).
- Flag-gated records (S7, S8) respect per-record visibility independently of section tier.
- HTTP denials follow one oracle: `401` for invalid or inactive session; `404` for a missing resource or a target whose existence is hidden from the actor (leak-free body); `403` for a visible resource where the feature or action is forbidden. List endpoints omit invisible rows. Hidden-target `404` precedes mutation permission checks. This resolves CONFLICT-UM-01 at product level; historical UMAC `403` empty-audience artifacts are stale and are not rewritten.

#### FR-5: Custom field visibility inheritance

Custom fields carry visibility level: management (default), employee, or colleague. Filters and list columns respect visibility — users cannot infer hidden values via filter side channels.

---

### 4.2 Runtime Functional Role Administration

**Description:** HR Admin creates functional roles, assigns granular permissions, and assigns people to roles through the UI — no deploy or schema change. Permission revocation takes effect immediately. **V1 HR Admin configures the system; does not receive special employee-data access (DEC-108).**

**Functional Requirements:**

#### FR-6: Runtime role and permission CRUD

HR Admin can create, name, and configure functional roles; grant or revoke granular permissions including: create form campaigns, create action items, create/edit risks, create resourcing requests, fulfil resourcing requests, approve or reject proposed candidates, close resourcing requests, assign and end mentorships, maintain CDS records, edit the career timeline, create feedback, record a departure, manage custom fields, manage departments, change organisational relationships, and view each dashboard type.

**Consequences (testable):**
- New role creation and permission change require no code deploy.
- Removing a permission immediately removes capability for all holders.
- New functional role never grants access-role tier beyond holder's existing relationships.
- HR Admin permission changes affect **features only**, not data scope (**DEC-108**).

#### FR-7: People and relationship assignment

HR Admin assigns and revokes **functional roles** for users via UI.

Four organisational facts are access switches: an employee's manager, People Partner, and department, plus a department's manager. They are changed on a dedicated organisational-relationships screen by an actor holding the *change organisational relationships* permission. They are not writable through S1 or inline directory editing.

**Consequences (testable):**
- User with custom "IT Security" role and create-campaign permission can target audience within their own access scope only.
- Every organisational relationship change rejects unauthorized actors and self-assignment, is journaled atomically, and affects access on the next request.

#### FR-39: Full-profile access grant lifecycle

Full-profile access is granted and revoked separately from functional roles. Only a current holder may grant it; self-assignment is forbidden; the first holder is seeded; removing the last holder is blocked; every grant and revocation is journaled. The grant provides read access to every section and does not bypass functional permissions, no-self-assignment rules, or dedicated write operations.

#### FR-40: Relationship and grant journal

The platform records manager, People Partner, employee-department, department-manager, and full-profile-access changes, plus every shared-link access. Each record contains actor, subject, before and after values, and timestamp. It is readable by full-profile holders and by the subject's current manager and People Partner.

---

### 4.3 All Employees (Directory)

**Description:** Single list page for all authenticated employees. Columns, filters, inline edit, saved views, and export differ by resolved tier — not by separate pages. Realizes UJ-3 (audience selection), UJ-4.

**Functional Requirements:**

#### FR-8: Universal filter and column model

Any profile field — including derived fields (e.g., years with company) and runtime custom fields — can be used as sortable column and filter.

**Consequences (testable):**
- Custom field added by HR Admin is filterable and column-selectable without developer action.
- Colleague mode shows whitelist columns only.

#### FR-9: Inline editing

Editable columns write through to underlying profile fields subject to access matrix for viewer and field.

#### FR-10: Saved and shared views

Users save filter+column configurations as named tabs; views are owner-scoped and shareable with other managers.

#### FR-11: Export

Current view exports to `.xlsx` containing only columns the exporter is entitled to see.

---

### 4.4 Employee Profile and Self-Service

**Description:** Detail page assembled from entitled sections. Header shows manager, people partner, mentor. Self-service covers employee-editable sections per matrix. Realizes UJ-2.

**Functional Requirements:**

#### FR-12: Section-based profile rendering

Profile page renders only sections viewer's tier permits for target employee; header relationships visible per S1 rules.

#### FR-13: Employee self-service capabilities

Employee (Self tier) can: view grade, position, seniority, employment type, English level; edit S2/S3; upload photo and certificates; view career timeline, leaves (with link to timetracker), projects, CDS (including mark-own-IDP-complete), mentorship flag and pairs, shared feedback and flagged management notes, own action items; cannot view S6 or unflagged S7.

**Consequences (testable):**
- Employee API never returns risk level or unflagged management notes.

#### FR-14: Identity card field sourcing

Mentor, people partner, and direct manager are platform-managed. Current project(s) on identity card come from timetracker via pull-only sync (**DEC-103**).

---

### 4.5 Dashboards

**Description:** One dashboard engine; four configurations by functional role. Grouping dimension differs: people (UM, PP) vs project (DM, PM). PP dashboard excludes resourcing block.

**Functional Requirements:**

#### FR-15: Unit Manager dashboard

Grouped by people: headcount, **active** risk counts by level (where active means above `low`), open/overdue action items, active resourcing requests, open campaigns; people table with risk and trend, project, leave status; manager's own action items; navigation shortcuts.

#### FR-16: Delivery Manager dashboard

Grouped by project: one table per project (people, risk, leave); top counters across all DM projects; project selector filters the entire page and recalculates counters; shows own and PM-created resourcing requests. Requests without a project appear in an explicit **Unassigned** bucket and are included in All-project counters.

#### FR-17: Project Manager dashboard

Same as DM dashboard scoped to PM's projects only.

#### FR-18: People Partner dashboard

Same building blocks scoped to PP-assigned people; groupable by department or project; **no resourcing block**; HR-oriented widgets encouraged (incomplete profiles, CDS deadlines, campaign completion) as design freedom.

**Feature-specific NFRs:**
- Dashboard data respects tier resolution for every referenced employee.

---

### 4.6 Action Items and Form Campaigns

**Description:** Unified action item entity from manual creation or campaign activation. Realizes UJ-3.

**Functional Requirements:**

#### FR-19: Manual action item lifecycle

Managers (UM/DM/PM) and PP — plus any functional role with create-action-items permission — create action items for people in their access scope. Fields: title, description, assignee, author, due date, optional link, status, completion date, source. Lifecycle: open → completed (assignee) or cancelled (author with reason). Overdue items visually distinguished. Effective departure cancels only **open** items **assigned to** the departing person (`cancelled — departed`); items they authored for other active assignees remain open (FR-41).

#### FR-20: Form campaign flow

Author creates campaign (title, description, purpose, external form URL, due date); selects audience via All Employees filter engine (saved views supported; list frozen on activation); each recipient receives action item; recipient self-reports completion; sender sees per-person completion table with overdue state.

**Consequences (testable):**
- People joining after activation are not added to frozen campaign audience.
- External form content is never read or verified by the platform.
- The campaign author sees only recipient name and that campaign's action-item status; no other S14 data or profile section is widened, and the exception ends when the campaign closes.

---

### 4.7 Risk Management

**Description:** Per-employee risk records with level, description, details, date, and history. Separate risk dashboard for reporting line and PP scopes. Never visible to employee.

**Functional Requirements:**

#### FR-21: Risk record and trend

Risk levels have the fixed ascending order `low` < `need attention` < `medium` < `high` < `leaver`. History is retained and current = latest. A risk has no close/resolved state; it can move between any levels, including down to `low`. A trend arrow appears only when the level differs from the previous record. `leaver` is a prediction and must never be conflated with `dismissed` employment status.

#### FR-22: Risk dashboard

Counts include only active risks (levels above `low`, with medium/high/leaver emphasised); sortable/filterable table; drill-through to profile S6; scoped to people over whom the viewer holds Manager or People Partner access.

---

### 4.8 Resourcing

**Description:** DM/PM create platform-owned resourcing requests; UM fulfils with internal or external candidates; DM approves/rejects candidates and explicitly closes requests. There is no PeopleForce vacancy entity or vacancy synchronisation. Realizes UJ-1.

**Functional Requirements:**

#### FR-23: Request creation

DM/PM create resourcing requests with vacancy details and requirements, expected compensation level, duration, workload, **headcount** (default 1), and a required department. Project reference is optional; an unattached request is a normal state. The department routes the request to its responsible Unit Manager. A DM sees their own requests and those created by PMs of their projects.

Expected compensation is visible only to the request author, routed UM, and reviewing DM. It never appears on a profile, in S15, in a shared link, or in an export.

#### FR-24: Request fulfilment

UM sees requests routed to their department; proposes internal department members and/or external candidates; stores the PeopleForce candidate ID and link for every external candidate; and submits one or more candidates for DM review.

Submitting an internal employee automatically creates a request-bound shared link naming the reviewing DM as recipient. The evaluation view contains S1, S4, S11, S12, S5 limited to CV and certificates, and optionally S6; it never contains S2, S3, S7, or S8.

#### FR-25: Request review and rejection loop

DM approves or rejects each candidate with written reason. Each approval fills one headcount slot and the request shows filled and remaining slots. Filling the last slot does not auto-close the request: only the DM's explicit successful or unsuccessful close ends it. Rejected requests may receive new proposals until that close. Approval does not create a project record — assignment happens in timetracker and the profile updates on a later sync.

#### FR-26: Request history on profile

S15 records proposed → approved/rejected history and written feedback for internal employees; visible to Reporting line, Project line, and PP per matrix. Expected compensation is excluded.

---

### 4.9 Profile Sharing

**Description:** A Manager generates a read-only shared view for an authenticated, explicitly named recipient who otherwise lacks the required access. Resourcing also creates request-bound links automatically.

**Functional Requirements:**

#### FR-27: Shared link creation and constraints

Only S1 is enabled by default; every `cfg` section is off until deliberately selected for that link. S2/S5/S6/S8 require explicit re-enabling on every link. `{S3, S7, S13, S14}` is the never-share set. Default expiry is 24 hours and is configurable; resourcing-generated links live until the request is decided.

**Consequences (testable):**
- Viewer must be the authenticated named recipient; there is no anonymous or anyone-with-link mode.
- Shared link never grants write access.
- S14 absent from shared-link API payload and UI.
- Creator access is re-checked on every view; the link dies immediately when the creator's relationship ends.
- Any current Manager or People Partner of the subject can revoke the link and inspect its accesses; full-profile holders are the backstop, so no link is orphaned.
- Every access through the link is written to the relationship and grant journal.

---

### 4.10 Career Timeline

**Description:** System-generated event log for tracked changes; manual override for backfill and correction.

**Functional Requirements:**

#### FR-28: Automatic timeline events

System writes events on: join, grade change, position change, department change, FTE/subcontractor transition, extended leave, mentorship pair start/end.

#### FR-29: Manual timeline maintenance

An actor may add, edit, and delete timeline events for backfill and correction only when both dimensions allow the operation: the actor has applicable S9 write access and holds the runtime *edit the career timeline* permission. Departure is not a timeline event.

**Consequences (testable):**
- S9 `RW` without the functional permission is insufficient.
- The functional permission without applicable S9 access is insufficient.

---

### 4.11 CDS (Career Development System)

**Description:** Registry hub — not an assessment engine. Links to external matrix and result files; stores conclusions and IDP completion.

**Functional Requirements:**

#### FR-30: CDS section content

Profile CDS contains: link to current skills matrix file (department+position dictionary); assessment log (date, assessor, result file link, final conclusion text); IDP records (description, deadline, external file link, complete checkbox with completion date).

#### FR-31: CDS filtering from directory

All Employees supports date-of-last-assessment filters (before/after/between; never-assessed as explicit option) and has-open-IDP yes/no.

---

### 4.12 Mentorship

**Description:** Pair formation, availability, visibility, and durable closure with a required pair closure note — no session tracking.

**Bounded-context decomposition:** PM-FR-32 / PM-FR-33 / PM-FR-34 are decomposed in `_bmad-output/specs/spec-mentorship-domain/SPEC.md`. The former Mentorship PRD and its draft epic file are retained as historical source evidence. Mentorship is its own bounded context (AD-17) — pairs are durable workflow records, never `Relationship` rows or access edges.

**Functional Requirements:**

#### FR-32: Self-service mentorship status

Employee marks themselves open to mentoring and sees assigned mentor/mentees. Clearing the flag removes the employee from the future mentor pool but does not alter any active pair; status remains `mentor` while an active mentee exists. Effective departure clears the flag in the same transaction as pair auto-close. Returning to `active` employment does not restore availability; the person must opt in again.

#### FR-33: Mentorship assignment and closure

An actor with the *assign and end mentorships* permission selects a mentor from the company-wide willing pool and a mentee from people within the actor's access scope. Status transitions open-to-mentoring → mentor on first active pair. Ending a pair requires a closure note stored on the pair record, not as feedback. Ended pairs remain in history and create timeline events. When no active mentees remain, the mentor returns to open-to-mentoring unless they cleared the flag.

Closure notes are readable by Reporting line, Project line, and PP only; they are never exposed to mentor, mentee, or colleagues through the Self pair view. Departure auto-closes active pairs with a system note and bypasses the manual-note gate.

#### FR-34: Mentorship hub views

Company-wide willing-mentor pool of **active** employees showing S1 identity data plus availability, without exposing S13; dismissed people are excluded even if a leftover flag exists; scoped mentee assignment flow; active and ended pairs with dates and status; filterable mentorship status on All Employees.

---

### 4.13 Feedback

**Functional Requirements:**

#### FR-35: Feedback records on profile

Actors with applicable S8 access and the *create feedback* permission add feedback (subject, author, date, context, body) with visibility management-only (default) or shared-with-employee. Joining interview feedback is an S8 feedback record, never an S5 document. Requested feedback uses a targeted form campaign as its only distribution path; the campaign tracks responses and the requester enters received feedback manually. Records are chronological and period-filterable, with no comparison-between-periods feature.

---

### 4.14 Integrations

**Description:** Real integrations replace Iteration 1 mock data. Timetracker is load-bearing for permissions and display.

**Functional Requirements:**

#### FR-36: Timetracker — leaves

Pull leave types, dates, and status for S10 display and self-service link-out to manage leaves in timetracker. **Scope confirmed:** one of two timetracker APIs (Q&A Aug 19). No new timetracker endpoints will be created for this bootcamp.

#### FR-37: Timetracker — projects and people

Pull projects, assignments, PM, and DM mappings. Project assignment feeds project-line resolution (§2.1). Sync is sole writer of sync-managed policy rows.

**Consequences (testable):**
- Project assignment changes affect access within 15 minutes.
- During outage, the app remains available and serves last-known data behind a visible stale-data banner; after four hours of failed sync, all project-derived access is withdrawn.
- Before implementation, the provider contract must establish whether assignment history arrives as events or only current state at sync time.
- Prod timetracker project duplication is an operations concern, not a bootcamp blocker.

#### FR-38: PeopleForce — optional prefill

**Good-to-have** per §5.2 — not required for this iteration. If built, a single profile button loads candidate fields by PeopleForce candidate ID, shows incoming/current values side by side, and requires per-field acceptance. Existing values are never silently overwritten. Candidate-side mapping is configuration, writes still pass normal section authorization, and repeating the same confirmed operation is idempotent.

Grade, seniority, employee type, department, manager, People Partner, contract data, employment status, and risk can never be prefilled. External resourcing stores the PeopleForce candidate ID and link even when the API integration is absent.

**Identity resolution:** PeopleForce candidate ID is the durable cross-system key for external candidates — not email alone. Platform users reconcile via `ttId` and stored candidate IDs (requirements §6).

---

### 4.15 Employment Lifecycle

**Description:** Employment status is a time-bounded business fact and the single source for whether an employee has departed. It is distinct from technical row/account retention and from the predictive `leaver` risk level.

#### FR-41: Employment status and departure

Employment status values are `active` and `dismissed`. An authorized HR actor records a departure with an effective date and reason under the *record a departure* permission. Recording is blocked while the person still manages or partners anybody through a platform-owned manager, department-manager, or People Partner relationship; the UI prompts the actor to re-parent those relationships first. This does not add a separate project-management block beyond the normative rule.

On the effective date, the profile becomes read-only and leaves the default employee list while remaining filterable; only open action items **assigned to** the departing person become `cancelled — departed` (authored-for-others stay open); the open-to-mentoring flag is cleared and dismissed people are excluded from the willing-mentor pool; active mentorship pairs auto-close with a system note; the account deactivates; and every access held by the departed person ends immediately. Departure is never written as a career-timeline event. Rehire does not restore mentorship availability without explicit opt-in.

---

### 4.16 Departments

**Description:** Department is the sole organisational grouping entity behind the Unit Manager role, Reporting-line access, resourcing routing, CDS mapping, and department-change history.

#### FR-42: Nested department management

Every employee belongs to **one or more** departments *(amended 2026-09-02 — was "exactly one"; §4.17, `database-schema.md` §Project/Department)* and departments may nest. Managing a department grants Reporting-line access to everyone in it and its sub-departments; an employee is reachable through any of their departments. Department maintenance requires the *manage departments* permission; changing employee membership or a department manager additionally follows FR-7's organisational-relationship rules. A department change writes a career-timeline event, and the CDS matrix lookup keys on department entity plus position.

### 4.17 User Management domain decomposition

User Management owns the seeded `User` identity anchor, magic-link authentication, S1 identity maintenance, career timeline events, platform-owned organisational mutations, employment status/departure, and adoption of the Access Control facade on `/users` routes. Detailed contracts are defined in `_bmad-output/specs/spec-user-management-domain/SPEC.md`.

It does not own the Access Control matrix engine, Mentorship pairs, Timetracker synchronization, or department-administration product UX. The former User Management PRD and context-local epics remain historical decomposition evidence and do not override this PRD.

---

## 5. Non-Goals (Explicit)

- Compensation and salary data on profiles.
- Pre-onboarding / offer-acceptance profile creation.
- Email template management (eSender replacement).
- Hosting competency assessments or skills matrices in-app.
- Learning management (LMS) features.
- Mentorship goals, session logs, progress tracking beyond pair lifecycle.
- Project allocation percentages / workload modelling.
- In-app notifications centre and email notifications (§4.13 GOOD TO HAVE).
- Analytics and reporting module (§4.14 GOOD TO HAVE).
- Internationalization — English only (**DEC-104**).
- Anonymous or external-world shared-link access (**DEC-101**).
- Two-way sync of project assignment to timetracker (**DEC-103**).
- Full PeopleForce prefill integration (§5.2 good-to-have).

### 5.1 Deferred feature access constraints — Notifications

Notifications (§4.13) are out of MVP scope. When implemented, these invariants are **non-negotiable**:

- Notification content is assembled **after live tier resolution** — same server-side rule as FR-4.
- An employee **never** receives a notification derived from S6 (risk), unflagged S7 (management notes), or any `—` matrix cell for the Self audience (including S15 where applicable).
- A PM **never** receives a notification derived from an S7 note not flagged *visible-for-PM*.
- Colleague-tier recipients receive no notification content outside the Colleague whitelist (S1, S10 (dates only), S11 project name only).

---

## 6. MVP Scope

### 6.1 In Scope

- Seeded employee population imported from timetracker test environment — no employee creation, AD, or SSO (§4.17, §10).
- Normative §2–3 role model and S1–S16 access matrix with test coverage per audience and relationship path.
- Runtime functional role administration (FR-6, FR-7).
- All §4 required features: directory, profiles, self-service, four dashboards, action items, campaigns, risks, resourcing, sharing, timeline, CDS, mentorship, feedback.
- Real timetracker integration (leaves + projects/people) over the seeded population — required.
- PeopleForce optional prefill button (§5.2) — good-to-have; candidate ID storage and external link acceptable without integration.
- **Department entity** — normative in SoT §4.17 (v1.5), including nesting, exactly-one employee membership, Reporting-line access, and resourcing routing. Schema detail remains an architecture concern (addendum).
- Temporal employment status and the departure workflow (FR-41); effective-date executor **implementation** remains blocked on CC-06 (design resolved by PM/AD-20/22/23).
- Bootcamp engineering process requirements (BMAD, foundation phase, parallel decomposition, intelligent repository, three-stage quality gate).
- Deployed demonstrable environment — not laptop-only.

### 6.2 Out of Scope for MVP

| Item | Reason |
|------|--------|
| Notifications (§4.13) | GOOD TO HAVE — constraints in §5.1 |
| Analytics (§4.14) | GOOD TO HAVE |
| Pre-onboarding | §10 deferred |
| PeopleForce prefill integration | GOOD TO HAVE (§5.2) — candidate ID + external link sufficient without it |
| Custom-field storage decision | OQ-114 — architect AD by foundation-phase close |
| Dashboard widget access model detail | OQ-115 — architect AD by foundation-phase close |

---

## 7. Success Metrics

**Primary**

- **SM-1: Access-control test pass rate** — 100% of normative matrix negative tests pass in CI before release. Validates FR-3, FR-4, FR-5.
- **SM-2: Timetracker integration operational** — leaves and project/people sync run against real API in non-prod demo environment. Validates FR-36, FR-37.

**Secondary**

- **SM-3: Runtime role extensibility** — HR Admin creates a new functional role with subset of permissions and assigns a user — without deploy. Validates FR-6.
- **SM-4: Directory performance** — All Employees with 500+ records, arbitrary filters, returns within 2 seconds including permission resolution. Validates cross-cutting NFR.
- **SM-5: Process demonstration** — Foundation artifacts, parallel feature ownership, and intelligent-repo specs present and referenced in delivery retrospective. Bootcamp grading criterion.

**Counter-metrics (do not optimize)**

- **SM-C1: Feature count at expense of access tests** — shipping more surface area with failing or skipped access negative tests is not success regardless of SM-5 demo breadth.
- **SM-C2: Mock integration permanence** — timetracker mocked in production path after bootcamp deadline counts as failure even if UI is complete.

---

## 8. Cross-Cutting NFRs

| ID | Requirement |
|----|-------------|
| NFR-1 | Access-control correctness is the primary quality attribute; leaks are critical defects. |
| NFR-2 | Personal data: use only the delivered seeded test population; import no real employee data and place no real PII in agent contexts, logs, screenshots, or repository. |
| NFR-3 | All Employees list: ≤2s response at 500+ rows with permission resolution. |
| NFR-4 | External integration failures degrade gracefully; never take down core application. |
| NFR-5 | Responsive layout and accessibility for list, profile, and dashboard pages. |
| NFR-6 | English UI only (**DEC-104**). |
| NFR-7 | Functional-permission revocation is immediate; platform-owned relationship changes apply on the next request; project-derived access changes within 15 minutes and is withdrawn after four hours of failed sync. |

---

## 9. Integration and Dependencies

| System | Direction | Purpose | Status |
|--------|-----------|---------|--------|
| **Internal timetracker** | Inbound pull | (1) Leaves — types, dates, status for S10. (2) Projects/people — assignments, PM, DM for S11, identity card, project-line resolution (**FR-37**). | **Required** — seeded population delivered 26 August |
| **PeopleForce** | Optional prefill | Candidate ID storage; optional profile prefill button (§5.2) | Good-to-have — external link acceptable |
| **Corporate identity** | N/A (v1) | Authentication over seeded population | **Closed (OQ-110):** magic-link auth only; no AD/SSO provisioning |
| **External forms** | Outbound link | Campaign targets (MS Forms, Google Forms, etc.) | Ready |
| **CDS files** | Outbound link | Matrix, assessment, IDP documents | Manual dictionary maintenance |

**Identity:** Platform user, timetracker user, and PeopleForce candidate reconciled via durable IDs (`ttId`, PeopleForce candidate ID) — email alone insufficient (requirements §6).

---

## 10. Data Governance and Constraints

- **Classification:** Employee personal data (S2, S3), management-only notes (S7), risks (S6), and unshared feedback are restricted tiers.
- **Retention:** No retention policy is specified by v1.5. Treat production retention as an unresolved governance input; this PRD does not invent a placeholder implementation requirement.
- **Audit:** Shared-link access logged (FR-27). [ASSUMPTION: broader audit trail for profile reads not required in v1 unless HR specifies.]
- **Environments:** Use the delivered seeded test population and no additional real employee data (NFR-2).

---

## 11. Open Questions

Only unresolved product and architecture gates are listed here. Closed v1.5 questions are removed from the active table; historical resolutions remain in the Decision Log.

| ID | Question | Impact | Escalation |
|----|----------|--------|------------|
| OQ-121 | Token usage tracking for bootcamp | Process measurement | Bootcamp organizers |
| OQ-122 | Agent rule-loading for architecture docs | Dev experience | Architect |
| CC-04 | People Partner mutation — **design resolved** (PM/AD-19); remaining work is implementation and AccessJournal enrolment (PM/AD-29) | Blocks PP route delivery, not redesign | Product Owner + Architect |
| CC-06 | Departure executor — **design resolved** (PM/AD-20, PM/AD-22, PM/AD-23); remaining work is implementation, AD-23 participants, fencing/idempotency proof, and operational release gate | Blocks FR-41 production delivery. Still blocked by CC-07/CC-08/CC-09 implementation and OPERATIONAL-ENVELOPE | Product Owner + Architect |
| CC-07 | Relationship and grant journal — design approved (PM/AD-29); table absent | Blocks FR-7/FR-40 implementation | Product Owner + Architect |
| OQ-PERM-01 | Default holders for manage-custom-fields, assign/end-mentorships, approve/reject candidates, edit-career-timeline, and create-feedback permissions | Blocks seed/default role matrix. **Stays open** until a later PO batch. Do not invent grants. | Product Owner |
| OQ-AC-EDIT | Whether `user-management:edit` and mentorship write permissions enter the kernel seed or a separately approved increment | Blocks complete dual-gate writes | Product Owner + Architect |

**Recently resolved (see Decision Log and Correct Course records):** OQ-101–OQ-104, OQ-106, OQ-108–OQ-113, OQ-118–OQ-119; CC-02 Option 1; CC-03 Option 1; CC-11 Option 1; M8 Option 1; CONFLICT-UM-01 (HTTP 401/404/403); OQ-105 (PM/AD-26); OQ-114 (PM/AD-32); OQ-115 (PM/AD-33); OQ-116 (PM/AD-27); OQ-117 (PM/AD-34); CC-05 (PM/AD-28). Architecture journal/events/project-writer/department designs are PM/AD-29..AD-31 and PM/AD-35 — implementation still absent. Historical OQ-118/OQ-119 and CC-11 Option 1 meanings are preserved; architecture envelope/project-writer blockers use `ARCH-ENV-01` and `ARCH-PROJ-WRITER-01` (do not collide with those historical IDs).

Resolved decisions are incorporated only where they remain consistent with normative v1.5.

### Pre-sprint conditions (GO — parallel with foundation phase)

These must land **before the named wave starts**, not before foundation phase begins:

| Condition | Owner | Blocks |
|-----------|-------|--------|
| OQ-114 resolved: typed EAV custom-field storage (PM/AD-32); jsonb bag is transition debt | Architect | FR-8, Wave 1 directory |
| OQ-115 resolved: four fixed dashboard read models (PM/AD-33) | Architect | FR-15–18, dashboard Wave |
| CC-04 design resolved (PM/AD-19); implementation + AccessJournal enrolment (PM/AD-29) still open | Product Owner + Architect | FR-7, FR-40, PP implementation |
| CC-06 design resolved (PM/AD-20/22/23); executor/participants/ops proof still open | Product Owner + Architect | FR-41, UM Epic 5 implementation |
| CC-07 design resolved: AccessJournal (PM/AD-29); implementation still absent | Product Owner + Architect | FR-7, FR-40, relationship mutation implementation |

---

## 12. Assumptions Index

- **A-2:** Policy-attachment access engine per architecture spine implements FR-1–FR-4 without PRD-level mechanism detail (see addendum).
- **A-7:** Production retention remains an unresolved governance input. No retention mechanism is added to MVP scope without an approved requirement.

---

## 13. Product Traceability Index

The machine-readable row-level model is `_bmad-output/planning-artifacts/global-coverage/global-fr-epic-story-coverage.yaml`. This index defines product ownership; it does not duplicate every story edge.

| Normative source | Canonical product FRs | Primary domain/capability | Current delivery posture |
|---|---|---|---|
| §2–§3 | PM-FR-1–7, PM-FR-39–40 | Access Control | Kernel implemented; broader matrix/adoption partial or gated |
| §4.1 | PM-FR-8–11 | Directory | Uncovered beyond partial User list |
| §4.2–§4.3 | PM-FR-12–14 | User Management | Partial/in transition |
| §4.4 | PM-FR-15–18 | Dashboards | Uncovered; architecture gate open |
| §4.5, §4.12 | PM-FR-19–20 | Tasks/Campaigns | Uncovered |
| §4.6 | PM-FR-21–22 | Risk | Uncovered |
| §4.7 | PM-FR-23–26 | Resourcing | Uncovered |
| §4.8 | PM-FR-27 | Sharing | Uncovered |
| §4.9 | PM-FR-28–29 | User Management | Specified/gated |
| §4.10 | PM-FR-30–31 | CDS | Uncovered |
| §4.11 | PM-FR-32–34 | Mentorship | Specified/blocked; not implemented |
| §4.15 | PM-FR-35 | Feedback | Uncovered |
| §5.1 | PM-FR-36–37 | Timetracker integration | Uncovered |
| §5.2 | PM-FR-38 | PeopleForce prefill | Deferred/good-to-have |
| §4.16 | PM-FR-41 | User Management | Specified/blocked |
| §4.17 | PM-FR-42 | User Management/Departments | Partial and gated |

## 14. Product Definition of Done

The normative Definition of Done remains `docs/project-requirements.md` §9. Product completion requires both implemented behavior and evidence; a PRD, domain spec, epic, scenario, red E2E test, or architecture ratification alone is not implementation proof.

At product level:

- Every PM-FR has an explicit global coverage state and evidence pointer.
- Normative access-control negative tests pass for every applicable audience, path, and section.
- Timetracker integration operates against the required test environment.
- Runtime role extensibility, directory performance, deployment, and process evidence meet SM-1–SM-5.
- Specs match shipped behavior, and transition debt is either retired or explicitly accepted for a non-production slice.
