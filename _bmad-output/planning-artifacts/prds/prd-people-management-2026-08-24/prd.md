---
title: People Management Platform
status: draft
created: 2026-08-24
updated: 2026-08-26
---

# PRD: People Management Platform

## 0. Document Purpose

This PRD defines the **People Management Platform** for an internal engineering organisation (~500 employees). It is the product-requirements artifact for Team 7 (Lazy Load) in the AI-native SDLC Bootcamp 2.0 and the binding scope reference for UX, architecture, epics, and test design.

**Structure:** Glossary-anchored vocabulary; features grouped with globally numbered functional requirements (FR-N); assumptions tagged inline and indexed in §12.

**Existing inputs this PRD builds on (does not duplicate):**

| Artifact | Role |
|----------|------|
| `docs/project-requirements.md` v1.5 | Primary functional and normative scope |
| `_bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md` | Architectural invariants and deferred topics |
| `docs/architecture/access-control.md` | Access-control binding rules |
| `AI SLDC Bootcamp 2.0 Resources/Decision Log.md` | Confirmed `DEC-*` decisions |
| `AI SLDC Bootcamp 2.0 Resources/Open Questions.md` | Unresolved `OQ-*` gaps |
| Market landscape research (2026) | Strategic positioning — see `addendum.md` |

Technical implementation choices belong in `addendum.md` and downstream architecture — not in this document.

**Spec conflicts:** Where this PRD references `DEC-106`–`DEC-108`, those decisions clarify v1.5 requirements where the platform PRD was drafted earlier.

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

- See the people I am responsible for — directly or via project assignment — with the full managerial view of their profiles.
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
| **Department** | Org entity: every employee belongs to one department; departments nest (§4.17). |
| **Section (S1–S16)** | Atomic profile partition with its own access matrix cell per audience. |
| **Reporting line** | Transitive closure of reports-to and department-management relationships (§2.1). |
| **Project line** | Access from project assignment only — narrower §3.2 cells (§3.3.2). |
| **Direct unit manager** | Employee's immediate reports-to manager; with assigned PP, may manually write S9. |
| **Tier** | Resolved access role of a viewer with respect to a specific target employee. |
| **Policy attachment** | Data record linking a user to a managerial or functional capability scope. [ASSUMPTION: implementation uses unified policy model per architecture spine — see addendum.] |
| **Action item** | Single task entity: manual or campaign-generated; lifecycle open → completed (or cancelled by author). |
| **Form campaign** | Audience-selected distribution of external form links as action items. |
| **CDS** | Career Development System registry — links to external matrix/assessment files, conclusions, and IDP completion; does not host assessments. |
| **Shared link** | Time-limited, revocable, read-only profile view for authenticated users without reporting-line, project-line, or PP access over the subject. |
| **Colleague view** | Whitelist visibility: S1, S10 (dates only), S11 (project name only). |

---

## 4. Features

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
- When project assignment ends, derived access ends immediately (**DEC-102**).
- DM sees all people on their projects at same data level as subject's unit manager for those projects.
- PM sees project members; DM above PM sees PM's project scope plus remaining projects.

#### FR-3: Section-level access matrix

For each profile section S1–S16, the system enforces the normative matrix (Self / Reporting line / Project line / PP / Colleague / Shared link) with permissions RW, R, —, or cfg as specified.

**Consequences (testable):**
- Every `—` cell: section absent from UI, API payload, export, search results, error messages, and notifications for that audience.
- S7 management notes default invisible to employee and PM; PM reads only notes flagged visible-for-PM; employee reads only notes flagged visible-for-employee.
- Colleague view returns exactly S1, S10 (dates only), S11 (project name only) — enforced server-side.
- HR Admin is not a matrix audience; full profile access is a separate grant (§2.4).

#### FR-4: Server-side assembly on every request

Profile and list responses are assembled from entitled sections only, after live tier resolution per target employee.

**Consequences (testable):**
- Negative tests exist for every `—` matrix cell, every audience, and representative relationship paths (Definition of Done §9).
- Flag-gated records (S7, S8) respect per-record visibility independently of section tier.

#### FR-5: Custom field visibility inheritance

Custom fields carry visibility level: management (default), employee, or colleague. Filters and list columns respect visibility — users cannot infer hidden values via filter side channels.

---

### 4.2 Runtime Functional Role Administration

**Description:** HR Admin creates functional roles, assigns granular permissions, and assigns people to roles through the UI — no deploy or schema change. Permission revocation takes effect immediately. **V1 HR Admin configures the system; does not receive special employee-data access (DEC-108).**

**Functional Requirements:**

#### FR-6: Runtime role and permission CRUD

HR Admin can create, name, and configure functional roles; grant or revoke granular permissions including: create form campaigns, create action items, create/edit risks, create resourcing requests, fulfil resourcing requests, assign mentors, maintain CDS records, manage custom fields, view each dashboard type.

**Consequences (testable):**
- New role creation and permission change require no code deploy.
- Removing a permission immediately removes capability for all holders.
- New functional role never grants access-role tier beyond holder's existing relationships.
- HR Admin permission changes affect **features only**, not data scope (**DEC-108**).

#### FR-7: People and relationship assignment

HR Admin assigns and revokes **functional roles** for users via UI.

**People Partner relationships** are assigned or revoked by: (a) the employee's direct manager, (b) HR Admin, or (c) a more senior People Partner (Q&A Aug 19).

**Consequences (testable):**
- User with custom "IT Security" role and create-campaign permission can target audience within their own access scope only.
- PP assignment by unauthorized roles is rejected.

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

Grouped by people: headcount, risk counts by level, open/overdue action items, active resourcing requests, open campaigns; subordinate table with risk, project, leave status; manager's own action items; navigation shortcuts.

#### FR-16: Delivery Manager dashboard

Grouped by project: one table per project (people, risk, leave); top counters across all DM projects; project selector filters entire page and recalculates counters; shows own and PM-created resourcing requests.

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

Managers (UM/DM/PM) and PP — plus any functional role with create-action-items permission — create action items for people in their access scope. Fields: title, description, assignee, author, due date, optional link, status, completion date, source. Lifecycle: open → completed (assignee) or cancelled (author with reason). Overdue items visually distinguished.

#### FR-20: Form campaign flow

Author creates campaign (title, description, purpose, external form URL, due date); selects audience via All Employees filter engine (saved views supported; list frozen on activation); each recipient receives action item; recipient self-reports completion; sender sees per-person completion table with overdue state.

**Consequences (testable):**
- People joining after activation are not added to frozen campaign audience.
- External form content is never read or verified by the platform.

---

### 4.7 Risk Management

**Description:** Per-employee risk records with level, description, details, date, and history. Separate risk dashboard for reporting line and PP scopes. Never visible to employee.

**Functional Requirements:**

#### FR-21: Risk record and trend

Risk levels: low, need attention, medium, high, leaver. History retained; current = latest. Trend arrow when level changed vs previous record.

#### FR-22: Risk dashboard

Counts by level (medium/high/leaver emphasised); sortable/filterable table; drill-through to profile S6; scoped to viewer's reporting line and PP assignments.

---

### 4.8 Resourcing

**Description:** DM/PM create requests; UM fulfils with internal or PeopleForce external candidates; DM approves/rejects. Realizes UJ-1. **Department entity confirmed (DEC-107); routing below.**

**Functional Requirements:**

#### FR-23: Request creation

DM/PM create resourcing requests with vacancy details, compensation level expectation, duration, workload; project reference optional. DM sees own and PM requests on their projects.

**UM routing:** Once Department entity is implemented, DM selects UM from department-matched list. **Interim (until Department live):** DM manually selects UM from visible manager list (Q&A Aug 19).

#### FR-24: Request fulfilment

UM sees assigned requests; proposes internal unit members from their unit and/or external PeopleForce candidates; submits for DM review. Department membership determines eligible internal candidates once **DEC-107** is implemented.

#### FR-25: Request review and rejection loop

DM approves or rejects each candidate with written reason. Rejected requests may receive new proposals until DM closes successfully or unsuccessfully (**DEC-105**). Approval does not create project record — assignment happens in timetracker; profile projects update on next sync.

#### FR-26: Request history on profile

S15 records proposed → approved/rejected history for internal employees; visible to reporting line, project line, and PP per matrix.

---

### 4.9 Profile Sharing

**Description:** Manager generates read-only shared view for authenticated users evaluating candidates. **DEC-101** applies.

**Functional Requirements:**

#### FR-27: Shared link creation and constraints

Manager selects cfg-eligible sections per matrix; S2/S5/S6/S8 excluded by default; S3/S7/S13 never shareable; **S14 (Action Items) never shareable** — matrix cell is `—` for Shared link audience; default expiry 24h (configurable); revocable; access logged (timestamp, origin).

**Consequences (testable):**
- Viewer must be authenticated platform user.
- Shared link never grants write access.
- S14 absent from shared-link API payload and UI.

---

### 4.10 Career Timeline

**Description:** System-generated event log for tracked changes; manual override for backfill and correction.

**Functional Requirements:**

#### FR-28: Automatic timeline events

System writes events on: join, grade change, position change, department change, FTE/subcontractor transition, extended leave, mentorship pair start/end.

#### FR-29: Manual timeline maintenance

PP and the **direct unit manager** may add, edit, and delete timeline events for backfill and correction. Project-line managers receive S9 as **R only** for manual write (§4.9, DEC-106).

**Consequences (testable):**
- DM/PM with project-line access only cannot POST/PATCH/DELETE S9 events.
- Direct UM and PP can mutate S9 per matrix.

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

**Description:** Pair formation, visibility, and closure with required feedback — no session tracking.

**Functional Requirements:**

#### FR-32: Self-service mentorship status

Employee marks open-to-mentoring; sees assigned mentor/mentees.

#### FR-33: Mentorship assignment and closure

Manager/PP assigns pairs from willing mentors; status transitions open-to-mentoring → mentor on first pair; ending pair requires final feedback; ended pairs remain in history; timeline event on end; mentor returns to open-to-mentoring when no active mentees.

#### FR-34: Mentorship hub views

List of willing mentors; assignment flow; active and ended pairs with dates and status; filterable mentorship status on All Employees.

---

### 4.13 Feedback

**Functional Requirements:**

#### FR-35: Feedback records on profile

Managers and PP add feedback (subject, author, date, context, body) with visibility management-only (default) or shared-with-employee. Colleagues cannot browse others' feedback. Feedback requests implemented as targeted form campaigns.

---

### 4.14 Integrations

**Description:** Real integrations replace Iteration 1 mock data. Timetracker is load-bearing for permissions and display.

**Functional Requirements:**

#### FR-36: Timetracker — leaves

Pull leave types, dates, and status for S10 display and self-service link-out to manage leaves in timetracker. **Scope confirmed:** one of two timetracker APIs (Q&A Aug 19). No new timetracker endpoints will be created for this bootcamp.

#### FR-37: Timetracker — projects and people

Pull projects, assignments, PM, and DM mappings. Project assignment feeds project-line resolution (§2.1). Sync is sole writer of sync-managed policy rows.

**Consequences (testable):**
- Integration failure degrades gracefully — app remains available; stale project data fails closed on access (no widened grants).
- Prod timetracker project duplication is an operations concern, not a bootcamp blocker.

#### FR-38: PeopleForce — optional prefill

**Good-to-have** per §5.2 — not required for this iteration. If built: a single prefill button loads candidate fields by PeopleForce candidate ID with per-field preview and confirmation. External resourcing may store candidate ID and link out to PeopleForce when integration is absent.

**Identity resolution:** PeopleForce candidate ID is the durable cross-system key for external candidates — not email alone. Platform users reconcile via `ttId` and stored candidate IDs (requirements §6).

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
- Colleague-tier recipients receive no notification content outside the Colleague whitelist (S1, S10 with leave type, S11 project name only).

---

## 6. MVP Scope

### 6.1 In Scope

- Seeded employee population imported from timetracker test environment — no employee creation, AD, or SSO (§4.17, §10).
- Normative §2–3 role model and S1–S16 access matrix with test coverage per audience and relationship path.
- Runtime functional role administration (FR-6, FR-7).
- All §4 required features: directory, profiles, self-service, four dashboards, action items, campaigns, risks, resourcing, sharing, timeline, CDS, mentorship, feedback.
- Real timetracker integration (leaves + projects/people) over the seeded population — required.
- PeopleForce optional prefill button (§5.2) — good-to-have; candidate ID storage and external link acceptable without integration.
- **Department entity** — confirmed Q&A Aug 19 (**DEC-107**); formal requirements v1.3 amendment pending from Vitaliy.
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
| NFR-2 | Personal data: pseudonymised data in all non-production environments; no real PII in agent contexts, logs, or repository. |
| NFR-3 | All Employees list: ≤2s response at 500+ rows with permission resolution. |
| NFR-4 | External integration failures degrade gracefully; never take down core application. |
| NFR-5 | Responsive layout and accessibility for list, profile, and dashboard pages. |
| NFR-6 | English UI only (**DEC-104**). |
| NFR-7 | Permission revocation is immediate on relationship or role change (**DEC-102**). |

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
- **Retention:** No explicit policy in test assignment. HR stakeholder (Vitaliy Barkatov) to provide retention rules **before production deployment**. Architect to implement configurable retention hooks during foundation phase as a forward-compatible placeholder. Until then, follow organisation default when provided (**A-7**).
- **Audit:** Shared-link access logged (FR-27). [ASSUMPTION: broader audit trail for profile reads not required in v1 unless HR specifies.]
- **Environments:** Production-like structure with pseudonymised identities in lower environments (NFR-2).

---

## 11. Open Questions

Active gaps not resolved by Q&A Aug 19 or DEC-106–108. Resolved items removed; see Decision Log.

| ID | Question | Impact | Escalation |
|----|----------|--------|------------|
| OQ-105 | HR Admin grant/revoke chain for HR Admin role | Admin UX | Vitaliy — bootstrap + delegate pattern per Q&A |
| OQ-109 | Pre-onboarding profile state | Out of scope if pre-onboarding deferred | Closed by scope — pre-onboarding out |
| OQ-110 | Auth mechanism for v1 | Foundation-phase auth | **Closed by v1.5:** magic-link only; no AD/SSO provisioning |
| OQ-111 | Cross-system identity reconciliation | Identity sync | Resolved via durable IDs (`ttId`, PeopleForce candidate ID) per requirements §6; population via seed import (§4.17) |
| OQ-114 | Custom-field storage (EAV vs JSONB) | FR-8 — **blocks Wave 1 directory kickoff** | Architect (Dmytro Novyk): record AD by **foundation-phase close**. **Column-per-field excluded** (`docs/project-requirements.md` §6) |
| OQ-115 | Dashboard widget access model | FR-15–18 — **blocks dashboard Wave kickoff** | Architect (Dmytro Novyk): record AD by **foundation-phase close** |
| OQ-116 | Non-manager project assignment (info-sec case) | Policy targetRole values | Stakeholders |
| OQ-117 | Profile bounded context boundary | Repo structure | Architect |
| OQ-121 | Token usage tracking for bootcamp | Process measurement | Bootcamp organizers |
| OQ-122 | Agent rule-loading for architecture docs | Dev experience | Architect |

**Recently resolved (see Decision Log):** OQ-101 → DEC-107; OQ-102; OQ-103; OQ-104/OQ-118 → DEC-108; OQ-106 → DEC-106; OQ-108; OQ-112; OQ-113; OQ-119.

Resolved decisions incorporated: **DEC-101** through **DEC-108**.

### Pre-sprint conditions (GO — parallel with foundation phase)

These must land **before the named wave starts**, not before foundation phase begins:

| Condition | Owner | Blocks |
|-----------|-------|--------|
| OQ-114 resolved: custom-field storage pattern confirmed (column-per-field excluded) | Architect (Dmytro Novyk) | FR-8, Wave 1 directory |
| OQ-115 resolved: dashboard widget access model confirmed | Architect (Dmytro Novyk) | FR-15–18, dashboard Wave |
| OQ-110 resolved: magic-link auth over seeded population (no AD/SSO) | UM bounded context | Foundation-phase auth implementation |

---

## 12. Assumptions Index

- **A-1:** Authoritative scope is `docs/project-requirements.md` v1.5.
- **A-2:** Policy-attachment access engine per architecture spine implements FR-1–FR-4 without PRD-level mechanism detail (see addendum).
- **A-7:** No explicit data-retention policy until HR stakeholder (Vitaliy Barkatov) provides one **before production deployment**. Architect implements configurable retention hooks during foundation phase; pseudonymisation in non-prod applies until then.
