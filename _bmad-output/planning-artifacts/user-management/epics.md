---
stepsCompleted: [1, 2, 3]
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-user-management-2026-08-20/prd.md
  - _bmad-output/planning-artifacts/architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md
  - docs/architecture/api-conventions.md
  - docs/architecture/database-schema.md
  - docs/test-cases/user-management/README.md
  - docs/project-requirements.md
---

# people management - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for the `user-management` bounded context, decomposing the requirements from the [user-management PRD](../../prds/prd-user-management-2026-08-20/prd.md) and the [Architecture Spine](../../architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md) into implementable stories. No UX design contract exists for this domain yet (no `bmad-ux` run has been done), so this pass has no UX-Design-Requirements input.

Supporting sources folded in for precise, testable acceptance criteria (endpoint shapes, field names, persona names): [api-conventions.md](../../../../docs/architecture/api-conventions.md), [database-schema.md](../../../../docs/architecture/database-schema.md), and the stage-1 AD-1 scenario docs at [docs/test-cases/user-management/](../../../../docs/test-cases/user-management/README.md). **Note (2026-08-27):** CAP-1 `registration/um-reg-*` retired per spec v1.5; Story 1.1 uses `um-seed-*`.

## Requirements Inventory

### Functional Requirements

**Explicitly numbered in the PRD:**

- FR-1: The very first `User` in the system is created by the population seed/import script and assigned the HR Admin functional role directly (AD-12 bootstrap). There is no HTTP user-creation / registration flow (§4.17).
- FR-2: Authentication is passwordless: a magic link sent to `workEmail` is the sole login mechanism for the seeded population. No password is ever stored. No SSO and no Active Directory in scope (§4.17, §10).
- FR-3: First and subsequent logins use the same magic-link request/consume flow. Completing seed/import does not establish a session. There is no separate invite-link or registration-form login path.
- FR-4: Employee population is imported from the delivered seeded timetracker list only (§4.17). Creating employees via API or UI is out of scope. `isActive` is an internal account/row-retention flag, not employment status or a generic deactivation capability.
- FR-5: The complete set of v1.5 automatic career events is generated; manual add/edit/delete requires applicable S9 access plus the runtime permission; departure is not a timeline event.
- FR-6: Departure is recorded with effective date/reason, blocked while management/PP relationships remain, and applies the complete effective-date outcome. Implementation is blocked on CC-06.

**Derived from the PRD's Scope / Data Model prose (not literally numbered FR-n in the source, but stated as in-scope capability) and cross-checked against the existing test-case folders — sourced, not invented:**

- FR-5a *[PRD Scope + Data Model — User entity table; Story 1.1 seed]*: Seed/import populates `User` rows with S1 identity-card fields (`firstName`, `lastName`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`, `photo`, `ttId`). Birthday is two separate fields (day 1-31, month 1-12), no year — §3.2 S1 content is literally "birthday (day and month)". HTTP `POST /users` create is retired (v1.5 / AD-14).
- FR-7 *[PRD Data Model — `workEmail`/`ttId` notes]*: `workEmail` and `ttId` are unique at seed/import and on authorized identity updates.
- FR-8 *[PRD FR-2 mechanics]*: A seeded active user can request a magic link by `workEmail` and consume the returned token to establish a session.
- FR-9 *[PRD Data Model — S1]*: An actor may read/write S1 only when the access matrix and applicable functional permission allow it; Self can directly write only the photo. Manager, People Partner, and department are not writable through S1.
- FR-10 *[PRD organisational facts]*: A holder of *change organisational relationships* can change manager, People Partner, employee department, or department manager on the dedicated screen; self-assignment is rejected and the change is journaled atomically.
- FR-11 *[PRD Data Model — `UserEvents`]*: The system generates `joined_company`, `grade_change`, `position_change`, `department_change`, `employment_type_change`, `extended_leave`, `mentorship_start`, and `mentorship_end` events through the owning contexts' application boundaries.
- FR-12: Manual career-event add/edit/delete requires both applicable S9 access and the *edit the career timeline* permission.
- FR-13: Deleted/superseded events are absent from normal reads; the storage/history mechanism is owned by architecture.
- FR-14: Mentorship pair persistence is not part of User Management; a dedicated mentorship context owns durable pairs and supplies start/end events.
- FR-15: Public user listing exposes permission-safe profile fields and employment status, never technical `ttId`/`isActive` filters. The full §4.1 directory remains platform scope.

**Added 2026-09-01 (Access Control adoption reconcile — numbered past FR-15 to avoid colliding with the derived FR-7..FR-15 above; sourced from the UM PRD FR-16/FR-17 and `architect-handoff-phase-b.md` §1):**

- FR-16 *[PRD FR-16; adoption SPEC CAP-1/CAP-2/CAP-3; AD-21 amended]*: Every `user-management` controller authorizes target-scoped `/users/:id` through the real `AccessControlFacade` via `ACCESS_CONTROL_PORT`; `interim-access-control.adapter.ts` is deleted in the same cutover (no dual-running). `isAllowed` for `user-management:create`/`:deactivate`/`:list` (the ACM-1 seeded keys) delegates straight to the facade. `GET /users/:id` returns `200` with `{ data, canEdit }` — `data` the **S1 identity card**, `canEdit` a read-only dual-gate hint — for **any** active viewer over an active target — Self, reporting line, assigned PP, **or colleague** (§3.2 S1 row is `R` for the Colleague column; every active authenticated viewer is at least a Colleague); denials are `401` (session does not resolve to an active `User` — the session layer's job) and `403` (authenticated active viewer whose audience over the target is empty). Story 0.1 ships the minimal S1-card projection wrapped in the `{ data, canEdit }` envelope (replacing `toUserResponse`'s whole-row spread) — this is CAP-3, not the deferred FR-17 story. `canEdit` = `isAllowed(viewer, user-management:edit) && canAccessSection(viewer, 'S1', target) === 'write'`; `false` for every viewer until `user-management:edit` is seeded. `PATCH`/`PUT photo` are behind the §2.2 dual gate — blocked on a missing `user-management:edit` permission (Open Question). This makes NFR-4 concrete and testable. Authoritative contract: `_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md`.
- FR-17 *[PRD FR-17; `deferred-work.md` "Profile Projection"]*: The *further* audience-narrowed views beyond the S1 card — the colleague S10 dates-only view (own route `GET /users/:id/leaves`), the colleague S11 project-name-only view, S16 per-field custom-field visibility, S7/S8 record flags, and S1 derived-field immutability enforcement — are a separate UM-owned deliverable that calls the facade and only narrows its base section result. It is **no longer coupled to `GET /users/:id`** and no longer triggers any colleague decision — the colleague read works from Story 0.1's S1 card. (The former "flip colleague deny → allow-narrowed" adoption story UMAC-3 / Story 0.3 is removed.)

Project-relationship assignment (`type: 'project'`) stays separately and explicitly out of scope ("Department and Project administration — platform scope; project membership from timetracker sync (§5.1); department per §4.17").

### NonFunctional Requirements

Drawn from `project-requirements.md` §7, filtered to what binds `user-management` specifically:

- NFR-1 *[§7 "Personal data"]*: Use only the delivered seeded test population; import no real employee data and place no real PII in agent contexts, logs, screenshots, or the repository.
- NFR-2 *[§7 "Performance"]*: The `GET /users` list endpoint responds within 2 seconds for 500+ records with arbitrary filters and derived fields, including permission resolution (joint responsibility with access-control's AD-10 tier walk).
- NFR-3 *[§7 "Availability"]*: External integration failures (future timetracker/PeopleForce via `ttId`) degrade gracefully and never take down the application.
- NFR-4 *[§7 "Access control correctness"]*: `user-management`'s endpoints must compose correctly with access-control's audience-filtering (§3.3.4) — response bodies are audience-filtered per viewer; enforcing this is access-control's job via the AccessControl facade (AD-9), but every user-management controller must call through it rather than bypass it.

### Additional Requirements

From the Architecture Spine and its companion docs:

- No starter/greenfield template is specified anywhere in the architecture spine — Epic 1 Story 1 is ordinary scaffolding (NestJS + Prisma per the Stack table), not a named starter kit.
- **AD-1 gate:** stage-1 scenario docs under `docs/test-cases/user-management/` per story ownership.
- **AD-14 router shapes bind every endpoint** this domain builds: the `User` resource has no HTTP create or generic delete/deactivate path; profile fields, event collections, organisational changes, and departure use their approved dedicated contracts.
- **Organisational facts are not mentorship pairs:** reports-to, PP assignment, employee department, and department manager feed access and require same-transaction journal writes. Mentorship uses a durable pair aggregate in its own context.
- **AD-2/AD-5 hexagonal layout:** `user-management` uses the standard `application/domain/infrastructure` layout; domain code imports nothing from Prisma, NestJS transport, or HTTP.
- **AD-9:** every entitlement check in this domain's controllers goes through the AccessControl facade (`isAllowed`/tier checks) — never a direct policy-table read or role flag.
- **AD-12 fail-closed bootstrap:** the seed script is the only path that assigns the first HR Admin role; no other path in this domain may grant a role.
- **Explicitly blocked:** CC-04 (PP storage/write contract), CC-06 (scheduled departure state/executor), custom-fields storage, and the full directory engine. The BA stories remain authoritative, but implementation cannot invent the missing contracts.

### UX Design Requirements

N/A — no UX design contract exists for this domain (no `bmad-ux` run has produced a `DESIGN.md`/`EXPERIENCE.md` pair or legacy UX doc). This section will stay empty unless the user points to one.

### FR Coverage Map

| FR | Epic |
|---|---|
| FR-16 | Epic 0 — real facade adoption + `ACCESS_CONTROL_PORT` rebind (interim adapter removed) + minimal S1-card projection |
| FR-17 | Deferred Profile Projection story — the S10/S11/S16 colleague views on their own surfaces, S7/S8 flags, S1 derived-field immutability (decoupled from `GET /users/:id`) |
| FR-1 | Epic 1 — seed-script HR Admin bootstrap + population import |
| FR-4 | Epic 1 — seeded population import (no HTTP create/deactivate) |
| FR-5a | Epic 1 — S1 fields at import; `joined_company` at seed |
| FR-7 | Epic 1 — `workEmail`/`ttId` uniqueness on authorized writes |
| FR-9 | Epic 1 — permission-safe S1 reads/writes; Self writes photo |
| FR-15 | Epic 1 — permission-safe public profile listing |
| FR-2 | Epic 2 — passwordless magic-link is the sole login mechanism |
| FR-3 | Epic 2 — magic-link login; import does not establish a session |
| FR-8 | Epic 2 — request magic link, consume token, establish session |
| FR-11 | Epic 3 — system auto-writes every tracked `UserEvents` type |
| FR-12 | Epic 3 — permission-aware manual add/edit/delete |
| FR-13 | Epic 3 — deleted/superseded `UserEvents` excluded from reads |
| FR-10 | Epic 4 — manager, PP, employee-department, and department-manager changes |
| FR-6 | Epic 5 — record and apply departure |
| FR-14 | Handoff — dedicated Mentorship epic, outside User Management |

## Epic List

### Epic 0: Access Control Adoption
Rebind `ACCESS_CONTROL_PORT` in `user-management.module.ts` to a real `AccessControlFacade`-backed adapter in `src/user-management/infrastructure/` and delete the interim adapter in the same cutover (AD-21, no dual-running). Adopt the `GET /users/:id` read path now — `200` with `{ data, canEdit }` (`data` = the minimal **S1 identity card**, `canEdit` = the read-only dual-gate hint, `false` for all until `user-management:edit` is seeded) for any active viewer over an active target (Self, reporting, assigned PP, **or colleague**: §3.2 S1 row is `R` for the Colleague column); denials are `401` (unresolved session) and `403` (authenticated active viewer, empty audience). Story 0.1 replaces `toUserResponse`'s whole-row spread with the `{ data, canEdit }` mapper on that handler; the `{ data, canEdit }` envelope becomes the section/detail-read convention (rolled onto other routes as its own item). Put `PATCH /users/:id` and `PUT /users/:id/photo` behind the §2.2 dual gate once a `user-management:edit` permission exists. Proven by a real-consumer HTTP → router → session → AccessControl → PostgreSQL E2E with no provider overrides (AD-3). A **dedicated small epic**, not a story under Epic 1, because it is a cross-cutting port-rebind cutover touching the same controller as Epic 1 Story 1.2 and needs its own real-consumer E2E (architect handoff §1). **Numbered Epic 0** so it runs before Epic 1's write paths; its read path can start now because ACM-8 made the facade DI-resolvable from `AppModule`.
**FRs covered:** FR-16. (FR-17 — the further S10/S11/S16 colleague narrowing on their own surfaces — is the deferred Profile Projection story and is no longer coupled to this epic.)
**Authoritative contract:** `_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md` (+ `stories.yaml`, `.memlog.md`). This epics.md carries only the epic/story summary and FR mapping; the SPEC is the binding per-route contract.

### Epic 1: Employee Record Management
Authorized actors manage identity data over the seeded population. S1 reads/writes require both access and capability; Self can upload a photo; public listing exposes permission-safe profile fields rather than technical identity keys.
**FRs covered:** FR-1, FR-4, FR-5a, FR-7, FR-9, FR-15

### Epic 2: Magic-Link Authentication
Any employee in the imported population can request a magic link and log in, establishing the session every other epic's protected endpoints rely on.
**FRs covered:** FR-2, FR-3, FR-8

### Epic 3: Career Timeline
The system logs every required career event through the owning context, while authorized actors can manually add, edit, or delete events only when both access and functional permission allow it.

**Binding implementation constraint (AD-11):** system-triggered `UserEvents` writes happen synchronously, in the same transaction as the domain mutation that causes them, via an explicit call from that use-case's code — no event bus, no generic table-change listener, no `EventEmitterModule`-style pub/sub, even though NestJS makes that pattern easy to reach for. Every story in this epic that wires a new tracked-change hook follows this same one pattern.

**FRs covered:** FR-11, FR-12, FR-13

### Epic 4: Organizational Relationships
Holders of the dedicated permission change manager, People Partner, employee department, and department manager without self-assignment; every change is journaled and affects access on the next request. Mentorship is not an organisational access edge.
**FRs covered:** FR-10

### Epic 5: Employment Lifecycle
Authorized HR actors record departure and the platform applies its complete effective-date outcome. Implementation remains blocked until CC-06 defines the scheduled state and executor.
**FRs covered:** FR-6

### Epic Sequencing / Parallelization

Per project-requirements.md §8.2 (NORMATIVE, graded): "a situation where one person waits for another is unacceptable." Reading the epic list top-to-bottom as one dependency chain would violate that — but the real build-time dependency is looser than the product narrative suggests, per AD-3 (stage-2 E2E tests bind against fixture-seeded data in the real test DB, not against another epic's live HTTP endpoint):

- **Epic 0's read path (Story 0.1) can start now** — ACM-8 made `AccessControlFacade` DI-resolvable from `AppModule`, so the port rebind is a UM-module-only change; Story 0.1 also ships the minimal S1-card DTO. Its write path (Story 0.2) sequences **after** the missing-`user-management:edit`-permission decision (Open Question; option (a) triggers a new Access Control kernel seed AD-1 sequence first). There is **no Story 0.3** — the colleague `GET /users/:id` read is a positive `200` (S1 card) from Story 0.1, so there is no "flip" to schedule; the FR-17 Profile Projection story owns only the S10/S11/S16 colleague views on their own surfaces and is decoupled from this epic.
- Epic 0 shares `PATCH /users/:id` with Epic 1 Story 1.2. **Story 1.2's authorization acceptance criteria are satisfied by Epic 0**, not duplicated: Story 1.2 asserts data correctness (the write persists, or is rejected wholesale on a uniqueness conflict), Epic 0 asserts who is entitled (architect handoff §1 Sequencing).
- Epic 2's magic-link flow needs a `User` row to exist, not Epic 1's HTTP surface — its test module seeds via Prisma or the population import script. Epic 2 also **owns retiring the interim *session* resolver** (`interim-session-resolver.adapter.ts`) — Epic 0 keeps it and uses the `Bearer <token:<seeded-uuid>>` convention for its fixtures.
- Epic 3's event store and application boundary can be designed in parallel with owning contexts; each trigger integrates only after its source mutation exists.
- Epic 4's relationship stories are independent by fact type once the journal/application contracts are approved. **Every Epic 4 story's stage-2/production (journal-writing) work is blocked on CC-04 AND CC-07** (AD-19 Journal gate) — scenario prose may proceed; journal-writing stages cannot. Story 4.2 (PP) additionally needs CC-04 for persistence/cardinality. The AD-19 Department-boundary gate keeps PP HR-line propagation fail-closed to the directly assigned PP until the Department contract lands.
- Epic 5 BA/scenario work can proceed independently, but implementation is blocked on CC-06.

Net: Epic 0's read path and Epic 1 and Epic 2 remain parallel; Epic 0's write path waits on the permission decision; Epic 3, Epic 4, and Epic 5 are decomposed by independent contracts rather than treated as one serial chain.

## Epic 0: Access Control Adoption

The Access Control Kernel MVP is built and headless: `AppModule` resolves `AccessControlFacade` (ACM-8), but `user-management.module.ts` still binds `ACCESS_CONTROL_PORT` to `InterimAccessControlAdapter`, which authorizes `isAllowedForTarget` as `Boolean(userId)` — every authenticated session reads every full `User` profile — and authorizes `isAllowed` by an `actor.position === 'HR Admin'` string check that `access-control.md` prohibits. This epic closes that leak and puts `/users/:id` behind the real fail-closed facade, and ships the minimal S1 identity-card projection for `GET /users/:id`. It does **not** close the product gate: the *further* FR-17 narrowing (S10 dates-only, S11 name-only, S16 per-field visibility, S7/S8 flags, S1 derived-field immutability), list/filter/export/search projection, Project line, Department, PP HR-line, shared links, and the full-profile overlay all remain deferred and fail-closed.
**FRs covered:** FR-16.
**Authoritative contract:** `_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md` — the stories below mirror its `stories.yaml` (`UMAC-1`, `UMAC-2`; `UMAC-3` was removed 2026-09-01) and carry the summary + FR mapping only.

**Sequencing:** Story 0.1 can start now (ACM-8 done). Story 0.2 is conditional on the missing-`user-management:edit`-permission decision. There is no Story 0.3.

### Story 0.1: Adopt the Read Path and Rebind the Port (UMAC-1)

As the platform,
I want `/users/:id` target-scoped authorization resolved by the real `AccessControlFacade` and `GET /users/:id` to return the S1 identity card,
So that a session reads an identity card only when it resolves to an active audience over an active target — and no longer every full `User` row for every session.

**Acceptance Criteria:**

**Given** the interim adapter is bound
**When** this story lands
**Then** `user-management.module.ts` binds `ACCESS_CONTROL_PORT` to a new `@Injectable()` adapter in `src/user-management/infrastructure/` that injects `AccessControlFacade` and implements both `AccessControlPort` methods, and `interim-access-control.adapter.ts` is deleted in the same change (AD-21)
**And** `isAllowed(userId, feature)` delegates directly to `AccessControlFacade.isAllowed`; `POST /users`, `DELETE /users/:id`, `GET /users` keep working for the seeded HR-Admin session (the three features are the ACM-1 seeded keys) and fail closed otherwise

**Given** viewer V and target T
**When** V calls `GET /users/<T>`
**Then** the response is `200` with `{ data, canEdit }` — `data` = the **S1 identity card** (`id`, `firstName`, `lastName`, `photo`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`) — when V's Phase-0 audience set over T is non-empty (contains any of `self`, `reporting`, `pp`, or `colleague`; §3.2 S1 row is `R` for the Colleague column, and every active authenticated viewer is at least a Colleague), the **same `data` for every audience**
**And** `data` **drops** `ttId`, `isActive`, `customFields`, `createdAt`, `createdBy` (Story 0.1 routes `GET /users/:id` through a `{ data, canEdit }` mapper on that handler only, not a rewrite of the shared `toUserResponse`; the list / `POST` / `PATCH` / `DELETE` / photo responses are unchanged); derived S1 display fields (manager, people partner, department, mentor, current projects) are out of scope for this route until those contexts land and `data` omits them
**And** `canEdit` = `isAllowed(V, user-management:edit) && canAccessSection(V, 'S1', T) === 'write'` — a read-only hint (enforcement stays on `PATCH`); `false` for every viewer while `user-management:edit` is unseeded, and permanently `false` for a colleague (`canAccessSection` → `'read'`)
**And** a **`401`** when the session does not resolve to an active `User` (the session layer's job; the interim resolver is lax, so such a request currently surfaces as `403` via the guard), and a **`403`** when an authenticated active viewer's audience over T is empty (T not an active `User`; no existence distinction — human product decision 2026-09-01, no "leak-free 404")

**Given** AD-3's consumer rule
**When** the Stage-2 E2E runs
**Then** it exercises real HTTP → router → `SessionGuard` → `AccessControlGuard` → real `AccessControlFacade` → real Prisma → migrated PostgreSQL with **no provider overrides**, seeding real `User` rows and real `Relationship` rows (`direct`, `people_partner`) and issuing `Bearer <token:<seeded-uuid>>`

### Story 0.2: Adopt the Write Path Dual Gate (UMAC-2) — CONDITIONAL

As the platform,
I want `PATCH /users/:id` and `PUT /users/:id/photo` gated by both the functional permission and `write` S1 section access,
So that identity mutation obeys the §2.2 dual gate.

**Implementation gate:** blocked on Open Decision 1 (missing `user-management:edit` / photo permission). Option (a): a new three-stage AD-1 seed sequence in the Access Control kernel package adds the permission first; this story then consumes it. Option (b): this story implements a narrow `// INTERIM` write rule in the real adapter with a recorded expiry trigger.

**Acceptance Criteria:**

**Given** viewer V, target T
**When** V submits `PATCH /users/<T>`
**Then** `200` only when `AccessControlFacade.isAllowed(V, <edit permission key>)` is `true` **and** `AccessControlFacade.canAccessSection(V, 'S1', T) === 'write'`; `403` when either half fails
**And** manager / people-partner / department fields in the PATCH body are rejected regardless of audience (§3.2 fn 1), enforced in `EditUserAction`/`UpdateUserDto` and tested, with no relationship change
**And** `PUT /users/<T>/photo` succeeds only when V id == T id (Self-only) unless Product widens it

### Story 0.3 — REMOVED (2026-09-01, human product decision)

There is nothing to flip. §3.2's S1 (Identity card) row is `R` for the Colleague column, and every active authenticated viewer is at least a Colleague, so a colleague `GET /users/:id` returns `200` with the S1 identity card from **Story 0.1**. The deferred FR-17 Profile Projection story owns only the S10 dates-only, S11 project-name-only, and S16 per-field colleague views on their own surfaces (plus S7/S8 flags and S1 derived-field immutability), and is no longer coupled to `GET /users/:id`.

## Epic 1: Employee Record Management

Entitled actors manage identity records over the imported population (§4.17): permission-safe S1 read/edit, self photo upload, and paginated public-profile listing. Generic deactivation is not part of this epic. **Story 1.2's authorization ACs are satisfied by Epic 0** (Story 1.2 asserts data correctness; Epic 0 asserts entitlement).
**FRs covered:** FR-1, FR-4, FR-5a, FR-7, FR-9, FR-15

### Story 1.1: Import Seeded Population

As the system operator,
I want the employee population imported from the delivered timetracker export (`docs/Accounts_template.csv`),
So that all features operate over a fixed set of users without any creation, AD, or SSO provisioning flow.

**Stage-1 sub-deliverables (AD-1):** `um-seed-01` import success; `um-seed-02` no `POST /users` create path; `um-seed-03` bootstrap HR Admin present + root-row reuse. Author under `docs/test-cases/user-management/seed/` (or equivalent). CAP-1 `um-reg-01`..`um-reg-15` are **retired / superseded** — do not translate to stage-2 for product create.

**Import source — `docs/Accounts_template.csv` (the file shape from TT).** A semicolon-delimited timetracker export. Header: `FirstName;LastName;Email;Birthday;PositionId;PositionName;RegistrationDate;DepartmentId;DepartmentName;DismissedDate;IsDismissed;EmployeeType;TimeZone;CountryId;CountryCode;CountryName;CountryStateId;CountryStateName`. The file has **no employee-id column**, so the import is **keyed by the normalized `Email`** and `ttId` (AD-13) has no source column → left `null`. Full column → `User` field mapping and the OPEN items in `docs/test-cases/user-management/seed/README.md` and `spec-1-1-import-seeded-population.md`. In brief: `Email`→`workEmail` (normalized, natural key); `FirstName`/`LastName`→`firstName`/`lastName`; `Birthday`→`birthDay`/`birthMonth` (year dropped; `NULL`→both null); `RegistrationDate`→`companyJoinDate`; `PositionName`→`position`; `CountryName`→`country`; `workPhone`/`city`/`photo`/`ttId` have **no source column** → `null`; `createdBy`→the ACM-0 root id. **OPEN (do not guess):** `PositionId` (positions dictionary?), `DepartmentName`/`DepartmentId` (Department edge contract deferred — spine Deferred), `CountryCode`/`CountryStateName`, `EmployeeType`→S4 (not on the `User` row), `IsDismissed`/`DismissedDate`→`EmploymentStatus` §4.16 (interim: `User.isActive=false` for a dismissed row until the aggregate lands, Epic 5/CC-06), `TimeZone` (not imported; distinct from AD-20's `BUSINESS_TIME_ZONE`).

**Kernel-reality constraints (2026-09-01, from the Access Control Kernel MVP):**
- **DEC-UM-007 canonical at write.** The seed/import writer trims and lowercases `workEmail` and **stores the normalized value** — not just on lookup. The DB `users_workEmail_key` index is on the raw stored value, so normalized uniqueness is a writer-side guarantee; a database-enforced functional unique index is separately gated deferred work (`deferred-work.md`).
- **DEC-UM-009 reuse the root id.** ACM-0 (`npm run db:seed`) has already created the single active root `User` with a normalized `workEmail` before import runs (order: `db:deploy` → `db:seed` → `db:bootstrap:access-control` → `start:prod`). A CSV row whose normalized `Email` matches `ROOT_WORK_EMAIL` **updates the existing ACM-0 root `User`** in place and never inserts a second row for a normalized email that already exists (active or inactive). The CSV's own sample row `dmytro.novyk+boot@altexsoft.com` is a normal employee row unless it matches `ROOT_WORK_EMAIL`.
- The `joined_company` system event at import must be written the same synchronous same-transaction way Epic 3 establishes — not via an HTTP create.

**Acceptance Criteria:**

**Given** a fresh, empty database
**When** the population import runs against `docs/Accounts_template.csv` (semicolon-delimited TT export, §4.17)
**Then** one `User` row exists per CSV row with the mapped S1 fields populated (`Email`→`workEmail` normalized, `FirstName`/`LastName`, `Birthday`→`birthDay`/`birthMonth` year-dropped, `RegistrationDate`→`companyJoinDate`, `PositionName`→`position`, `CountryName`→`country`)
**And** `workPhone`, `city`, `photo`, and `ttId` are `null` on every imported row — the CSV has no source column for them (assert absence, not population)
**And** `workEmail` is unique across imported rows and stored normalized (FR-5a, FR-7, DEC-UM-007)
**And** no HTTP `POST /users` path is required or used for this outcome (AD-14, §4.17)
**And** exactly one bootstrap `User` holds the HR Admin functional role via seed (FR-1, AD-12); bootstrap entitlement proof remains owned by access-control's `fc-03` when that suite exists — not duplicated here (traces `um-seed-01`, `um-seed-03`)

**Given** the seed/import completed successfully
**When** an entitled actor lists or reads users (Stories 1.2 / 1.5 surfaces)
**Then** every seeded employee is addressable as an existing `User` (`isActive: true` unless the seed marks otherwise)
**And** each imported `User` has a system `UserEvents` `joined_company` entry dated from seed data / import (FR-5a / FR-10 wiring for import — not via registration)

**Given** the application is running after seed
**When** any client calls `POST /users`
**Then** the route is absent or permanently rejected (no create capability) — product create-path is out of scope; CAP-1 HTTP registration is retired (traces `um-seed-02`)

### Story 1.2: View and Edit an Employee's Identity-Card Fields

As an actor whose access audience and functional capability both permit the operation,
I want to read and edit an employee's S1 identity-card fields,
So that identity data stays accurate without bypassing the two-dimensional access model.

Self reads S1 and can write only their photo through Story 1.3. Manager, People Partner, and department are displayed in S1 but changed only through Epic 4's dedicated organisational-relationships flow.

**Authorization is Epic 0's, not this story's (2026-09-01).** This story asserts **data correctness** — the write persists and reflects on a follow-up read, or is rejected wholesale on a `workEmail`/`ttId` conflict (`409`). *Who* is entitled to `PATCH`/`GET /users/:id` — every active audience (Self / reporting / PP / colleague) reads the S1 card, an unresolved session gets `401` and an authenticated active viewer with an empty audience gets `403`, and `PATCH` is behind the §2.2 dual gate — is asserted by Epic 0 against the real facade (architect handoff §1). Do not duplicate entitlement scenarios here; do not harden the interim-permissive `isAllowedForTarget` as intended behaviour.

**Acceptance Criteria:**

**Given** Bob has reporting-line access to Alice (`position: "Engineer"`, `city: "Warsaw"`)
**When** Bob submits `PATCH /users/<aliceId>` with `{ position: "Senior Engineer", city: "Krakow" }`
**Then** the response is `200` reflecting the new values
**And** a subsequent `GET /users/<aliceId>` reflects the same values (FR-9; traces `um-pf-01`)

**Given** Colin exists with `workEmail: colin@company.example`
**When** Bob attempts to `PATCH` Alice's `workEmail` to that address
**Then** the response is `409`
**And** Alice's `workEmail` is unchanged on a follow-up read (FR-7; traces `um-pf-03`)

**Given** Bob attempts to change Alice's manager, People Partner, or department through the S1 patch
**When** the request is validated
**Then** the organisational fields are rejected and no access relationship changes (FR-9)

### Story 1.3: Self Uploads Own Photo

As an employee,
I want to upload my own profile photo,
So that my identity card shows an accurate photo without anyone else's help.

**Acceptance Criteria:**

**Given** Alice is viewing her own profile (`photo: null`)
**When** Alice submits `PUT /users/<aliceId>/photo` with a new photo file
**Then** the response is `200` with a non-null `photo` reference
**And** a subsequent `GET /users/<aliceId>` reflects the same value (FR-9; traces `um-pf-02`)

### Story 1.5: List Employees with Pagination and Filters

As an entitled actor,
I want to list employees with pagination and filters on identity-card fields,
So that I can find relevant employees without pulling the entire directory.

Scope: permission-safe visible identity fields and employment status. Technical `ttId` and `isActive` are never public filters. Dynamic custom fields, saved views, export, and inline editing remain owned by the platform directory scope rather than this bounded-context epic.

**Acceptance Criteria:**

**Given** more than one page's worth of `User` records exist
**When** an entitled actor submits `GET /users` with pagination params
**Then** the response is `200` with a page of results plus pagination metadata (FR-15)

**Given** `User`s exist with varying `country` values
**When** an entitled actor submits `GET /users?country=Poland`
**Then** every returned record has `country: "Poland"` (FR-15)

**Given** `User`s exist with varying `position`/`city` combinations
**When** an entitled actor submits `GET /users?position=Engineer&city=Krakow`
**Then** every returned record matches both filters (FR-15)

**Given** Colin's effective employment status is `dismissed`
**When** an entitled actor opens the default employee list
**Then** Colin is absent by default but can be found through an authorized employment-status filter (FR-15, FR-6)

## Epic 2: Magic-Link Authentication

Any active employee in the imported population can request a magic link and log in. **FRs covered:** FR-2, FR-3, FR-8.

### Story 2.1: Request a Magic Link by Work Email

As an employee,
I want to request a magic link sent to my work email,
So that I can log in without ever needing a password.

**Acceptance Criteria:**

**Given** Alice exists with `workEmail: alice@company.example`
**When** Alice submits `POST /auth/magic-link` with that email, unauthenticated
**Then** the response is `200` confirming dispatch (e.g. `{ sent: true }`), with no token or password field in the body (FR-2; traces `um-auth-01`)

**Given** no `User` matches `nobody@company.example`
**When** a magic link is requested for that address
**Then** the response is `200` with the identical body shape as the success case — the endpoint never reveals whether an account exists (account-enumeration guard)
**And** no email is actually dispatched, asserted against the email-adapter fake at stage 2 (traces `um-auth-02`)

### Story 2.2: Consume a Magic-Link Token to Establish a Session

As an employee,
I want to consume my magic-link token,
So that I get a working session I can use for authenticated requests.

**Acceptance Criteria:**

**Given** Alice holds a valid, unexpired magic-link token from a prior request
**When** Alice submits `POST /auth/magic-link/consume` with that token
**Then** the response is `200` with a session/access token scoped to Alice
**And** a follow-up authenticated request (e.g. `GET /users/<aliceId>`) using that session succeeds with `200` (FR-2, FR-8; traces `um-auth-03`)

**Given** Alice's magic-link token has since expired
**When** Alice submits that expired token to the consume endpoint
**Then** the response is `401` with no session token in the body (traces `um-auth-04`)

**Given** Alice already consumed her magic-link token once
**When** the same token value is submitted again, by anyone
**Then** the response is `401` with no session token in the body — a consumed token is not replayable (traces `um-auth-05`)

**Given** Colin's departure effective date has passed and his account is inactive
**When** Colin requests or consumes a magic link
**Then** no usable session is established; the request response remains enumeration-safe and a pre-departure token fails at consume (FR-6; traces `um-auth-06`)

First login uses the magic-link flow (FR-3) — import does not establish a session.

## Epic 3: Career Timeline

The system records every v1.5 career event through the owning context. Manual add/edit/delete requires both applicable S9 access and the *edit the career timeline* permission. **FRs covered:** FR-11, FR-12, FR-13.

**Binding implementation constraint (AD-11):** system-triggered writes happen synchronously, in the same transaction as the domain mutation that causes them, via an explicit call from that use-case's code — no event bus, no generic table-change listener, no `EventEmitterModule`-style pub/sub. Every story below that wires a new tracked-change hook follows this same pattern.

### Story 3.1: System Auto-Generates Career Timeline Events

As the system,
I want to write a career-timeline event whenever any tracked change occurs,
So that every audience entitled to S9 sees an accurate history without manual duplication.

**Acceptance Criteria:**

**Given** the seed/import completed for employee Nina (Story 1.1)
**When** Nina's career timeline is read
**Then** a `UserEvents` row exists with `type: "joined_company"`, `source: "system"`, `eventDate` matching her `companyJoinDate` — written at import time, not via HTTP create (FR-11; traces `um-ct-01`)

**Given** the seed population includes Alice with `position: "Engineer"`
**When** Bob edits Alice's `position` to `"Senior Engineer"` via `PATCH /users/<aliceId>` (Story 1.2)
**Then** a `UserEvents` row is written for Alice with `type: "position_change"`, `source: "system"`, `details: { from: "Engineer", to: "Senior Engineer" }` (FR-11; traces `um-ct-02`)

**Given** any owning context commits a grade, department, employment-type, extended-leave, or mentorship-pair transition
**When** the transaction completes
**Then** exactly one corresponding `grade_change`, `department_change`, `employment_type_change`, `extended_leave`, `mentorship_start`, or `mentorship_end` event is appended through the User Management application boundary

**Given** an employee's departure takes effect
**When** the career timeline is read
**Then** no departure/left-company event exists because employment status is the sole source (FR-11)

### Story 3.2: Authorized Actor Manually Adds a Backfill Entry

As an actor with S9 write access and the *edit the career timeline* permission,
I want to manually add a career-timeline entry,
So that I can backfill history that predates the system (the legacy Excel headcount record).

**Acceptance Criteria:**

**Given** Paula has applicable S9 write access to Alice and the runtime permission
**When** Paula submits `POST /users/<aliceId>/events` with a `mentorship_end` entry dated before the system existed
**Then** the response is `201` with `source: "manual"`
**And** the entry appears on a subsequent `GET /users/<aliceId>/events` (FR-12; traces `um-ct-03`)

**Given** Bob has S9 `RW` through a relationship but lacks the functional permission
**When** Bob attempts the same operation
**Then** the request is denied and no event is written

**Given** an actor holds the functional permission but lacks S9 write access to Alice
**When** the actor attempts the operation
**Then** the request is denied and no event is written

### Story 3.3: Authorized Actor Edits or Deletes an Event

As an actor with S9 write access and the *edit the career timeline* permission,
I want to correct a wrongly-inferred event or delete one that shouldn't exist,
So that the timeline stays accurate while the approved persistence mechanism preserves required history.

**Acceptance Criteria:**

**Given** Alice has a system-generated `position_change` event with a wrong `details.to` value
**When** an authorized actor submits the approved correction operation
**Then** the response succeeds and a subsequent read exposes only the corrected event (FR-12; traces `um-ct-05`)

**Given** a manually-added event needs no replacement
**When** an authorized actor deletes it
**Then** the response succeeds and the event is absent from subsequent normal reads (FR-12, FR-13; traces `um-ct-06`, `um-ct-07`)

**Given** an actor lacks either S9 write access or the functional permission
**When** they attempt to edit or delete an event
**Then** the request is denied and the timeline is unchanged

## Epic 4: Organizational Relationships

Holders of the dedicated permission change the four organisational facts that alter access. Every change rejects self-assignment, is journaled atomically, and affects platform-owned access on the next request. **FRs covered:** FR-10.

**Journal gate (AD-19, 2026-09-01).** Every story here writes the §3.4 journal in the same transaction as the fact change. CC-07 owns the immutable relationship/access-journal schema, snapshot payload, reader authorization, and transaction-enrolment contract. **Scenario prose may proceed; the stage-2 E2E and production (journal-writing) stages of Stories 4.1, 4.2, and 4.3 are blocked until CC-07 is approved** — `UserEvents` is not a journal substitute. Story 4.2 additionally needs CC-04 for PP persistence/cardinality. **AD-19 Department-boundary gate:** assigned-PP resolution may use the edge immediately, but transitive HR-line propagation stays fail-closed to the directly assigned PP until the Department contract identifies the HR root/boundary.

### Story 4.1: Change an Employee's Manager

As a holder of the *change organisational relationships* permission,
I want to change an employee's manager on the dedicated screen,
So that reports-to access reflects the current organisation without being editable through S1.

**Implementation gate:** the atomic-journal half is blocked on **CC-07** (AD-19 Journal gate). Scenario prose and the reports-to fact-change design may proceed. DEC-UM-005 (reports-to reassignment: explicit `DELETE` then `POST`, second `POST` → `409`) still applies.

**Acceptance Criteria:**

**Given** Alice reports to Bob and Root holds the required permission
**When** Root changes Alice's manager to Nina
**Then** the relationship is replaced atomically, Alice's Reporting-line access resolves through Nina on the next request, and the journal records actor, subject, before/after values, and timestamp

**Given** Root attempts to make Root Alice's manager without already being entitled to manage that department/relationship
**When** the change is submitted
**Then** self-assignment is rejected and no relationship or journal entry is committed

**Given** an actor lacks the permission
**When** they attempt the change
**Then** the request is denied and the existing manager remains

### Story 4.2: Change an Employee's People Partner

As a holder of the *change organisational relationships* permission,
I want to change an employee's People Partner,
So that PP access and the HR-line chain reflect the current assignment.

**Implementation gate:** CC-04 must approve persistence/cardinality and the write contract, **AND CC-07 must approve the journal schema** (AD-19 Journal gate), before stage-2 or production work. Scenario prose may proceed now.

**Acceptance Criteria:**

**Given** CC-04 is approved and Alice is assigned to Paula
**When** an authorized actor changes the assignment to Nina
**Then** Paula's PP access ends and Nina's PP/HR-line access begins on the next request
**And** the journal records the before/after assignment atomically

**Given** an actor attempts to assign themselves as Alice's PP
**When** the change is submitted
**Then** self-assignment is rejected and the current assignment remains

### Story 4.3: Change Employee Department or Department Manager

As a holder of the *change organisational relationships* permission,
I want to change an employee's department or a department's manager,
So that department-derived access, routing, and CDS ownership remain correct.

**Implementation gate:** the atomic-journal half is blocked on **CC-07** (AD-19 Journal gate); department-derived access also depends on the still-open Department edge contract (spine Deferred) — until it lands, `department`-targeted policy rows contribute nothing (fail-closed). Scenario prose may proceed.

**Acceptance Criteria:**

**Given** Alice belongs to Department A and an authorized actor moves her to Department B
**When** the change commits
**Then** Alice belongs to exactly one department, Reporting-line access changes on the next request, a `department_change` career event is appended, and the journal records the before/after department

**Given** an authorized actor changes Department B's manager
**When** the change commits
**Then** the new manager receives Reporting-line access to Department B and nested departments on the next request
**And** the journal records the before/after manager

**Given** an actor attempts to make themselves manager of a department they are not already entitled to manage
**When** the change is submitted
**Then** self-assignment is rejected and no access changes

## Epic 5: Employment Lifecycle

Authorized HR actors record departure and the platform applies the complete effective-date outcome. **FRs covered:** FR-6.

### Story 5.1: Record a Departure

As an actor with the *record a departure* permission,
I want to record an employee's effective departure date and reason,
So that the lifecycle change is scheduled without changing current status early.

**Implementation gate:** CC-06 must define the scheduled state and executor before stage-2 or production work.

**Acceptance Criteria:**

**Given** Alice manages nobody, manages no department/project, and is nobody's People Partner
**When** an authorized actor records a future departure date and reason
**Then** the scheduled departure is stored without changing Alice's current `active` status before that date

**Given** Alice still manages or partners at least one person through any v1.5 management relation
**When** departure is submitted
**Then** the operation is blocked and the UI identifies relationships that must be re-parented, offering Alice's own manager as a default where applicable

### Story 5.2: Apply an Effective Departure

As the platform,
I want to apply a recorded departure exactly once on its effective date,
So that the employee and every access they hold leave the active system consistently.

**Acceptance Criteria:**

**Given** Alice's recorded departure reaches its effective date
**When** the approved CC-06 executor processes it
**Then** employment status becomes `dismissed`, the profile becomes read-only and leaves the default list while remaining filterable, open action items become `cancelled — departed`, active mentorship pairs auto-close with a system note, and Alice's account deactivates
**And** every access Alice held ends immediately, overriding the normal project-line 15-minute window
**And** no departure event is added to the career timeline

**Given** the executor retries the same departure after a partial or uncertain failure
**When** processing resumes
**Then** the outcome is idempotent and no duplicate status, cancellation, closure, or journal effect is created

## Mentorship Handoff

The former User Management Story 4.2 is superseded (AD-17). Mentorship is **now
planned** in its own bounded context — see
[`_bmad-output/planning-artifacts/mentorship/epics.md`](../mentorship/epics.md)
and [`prd-mentorship-2026-09-01/`](../prds/prd-mentorship-2026-09-01/prd.md)
(both `draft`, 2026-09-01). That package owns the company-wide willing pool,
scoped mentee selection, the durable `MentorshipPair` lifecycle, required closure
notes and their restricted projection, availability-flag behaviour, career
events, and departure auto-close. User Management receives only the
`mentorship_start` / `mentorship_end` career events, via Epic 3 Story 3.1's
application boundary.
