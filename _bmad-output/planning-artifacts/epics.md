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

This document provides the complete epic and story breakdown for the `user-management` bounded context, decomposing the requirements from the [user-management PRD](../prds/prd-user-management-2026-08-20/prd.md) and the [Architecture Spine](../architecture/architecture-people-management-2026-08-19/ARCHITECTURE-SPINE.md) into implementable stories. No UX design contract exists for this domain yet (no `bmad-ux` run has been done), so this pass has no UX-Design-Requirements input.

Supporting sources folded in for precise, testable acceptance criteria (endpoint shapes, field names, persona names): [api-conventions.md](../../../docs/architecture/api-conventions.md), [database-schema.md](../../../docs/architecture/database-schema.md), and the existing stage-1 AD-1 scenario docs at [docs/test-cases/user-management/](../../../docs/test-cases/user-management/README.md) (24 files, status: draft, pending developer approval).

## Requirements Inventory

### Functional Requirements

**Explicitly numbered in the PRD ("Functional Requirements — Account & Authentication"):**

- FR-1: The very first `User` in the system is created by a seed script and assigned the HR Admin functional role directly (AD-12 bootstrap) — not through the registration flow below.
- FR-2: Authentication is passwordless: a magic link sent to `workEmail` is the sole login mechanism (temporary, ahead of SSO). No password is ever stored.
- FR-3: Completing the registration form does not log the user in directly — it triggers the same magic-link email used for every subsequent login. There is no separate "invite link" mechanism.
- FR-4: HR Admin submits the registration form on the new hire's behalf (not self-registration). `isActive` alone is sufficient — no intermediate "not yet activated" state; HR-Admin-entered records go straight to `isActive: true` and the magic link (FR-3) is the activation-equivalent step.

**Derived from the PRD's Scope / Data Model prose (not literally numbered FR-n in the source, but stated as in-scope capability) and cross-checked against the existing test-case folders — sourced, not invented:**

- FR-5 *[PRD Scope + Data Model — User entity table; test-cases/registration/]*: HR Admin can create a `User` record with the S1 identity-card fields (`firstName`, `lastName`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDate`, `companyJoinDate`, `photo`, `ttId`).
- FR-6 *[PRD Data Model — `workEmail`/`ttId` notes; test-cases README "uniqueness constraints on write"]*: `workEmail` and `ttId` are enforced unique at write time (registration and profile edit).
- FR-7 *[PRD FR-2 mechanics; test-cases/auth/]*: A user can request a magic link by `workEmail` and consume the returned token to establish a session.
- FR-8 *[PRD Data Model — "the one Self-writable identity-card field per §3.2"; test-cases/profile/]*: An entitled actor (Self / Manager-line / PP, per access-control) can read and edit S1 identity-card fields via `GET`/`PATCH /users/:id`; `photo` is the one field Self can write directly, via `PUT /users/:id/photo`.
- FR-9 *[PRD Data Model — `User.isActive`; test-cases/deactivation/]*: HR Admin can deactivate a `User` (`DELETE /users/:id`), flipping `isActive` to `false`; the record is preserved and excluded from active-only views.
- FR-10 *[PRD §4.9 + Data Model — UserEvents; test-cases/career-timeline/]*: The system automatically writes a `UserEvents` entry when a tracked change happens to a `User` — currently wired for `joined_company` and `position_change` only (the other six documented types have no triggering context yet, per the test-case suite's own scope note).
- FR-11 *[PRD §4.9 "PP and UM can... manually add timeline events"]*: PP and Manager-line (UM) can manually add a `UserEvents` entry for historical backfill.
- FR-12 *[PRD §4.9 "correct events the system inferred wrongly"; Data Model — immutable-fact model]*: PP and Manager-line can correct a wrongly-inferred `UserEvents` entry by soft-deleting the wrong entry and appending a new corrected one — never an in-place edit.
- FR-13 *[test-cases/README Conventions — "Absence is absence"]*: A soft-deleted `UserEvents` entry is excluded from reads, never returned with a null/placeholder body.
- FR-14 *[PRD Scope — "the pairing fact itself is in scope"; AD-11]*: Mentor pairing is attached/detached via `POST`/`DELETE /users/:id/relationships` (`type: 'mentorship'`), which fires the `mentorship_start`/`mentorship_end` `UserEvents` entries.
- FR-15 *[PRD Scope note, corrected 2026-08-22; Data Model — "Deliberately not stored on User" Manager bullet]*: Reports-to (manager) assignment has no external sync — timetracker only provides leave/vacation balances and reported working days (project-requirements.md §5.1), no hierarchy data. HR Admin manually assigns/revokes a user's manager via `POST`/`DELETE /users/:id/relationships` (`type: 'direct'`), the same generic attachment mechanism as mentorship pairing (FR-14).

Project-relationship assignment (`type: 'project'`) stays separately and explicitly out of scope ("Department and Project creation/assignment — HR-Admin-gated, covered under access-control/policies").

- FR-16 *[User decision 2026-08-22, closing a gap PRD scope left open; project-requirements.md §4.1 + NFR-2 + AD-14 route table]*: An entitled actor can list `User`s via `GET /users` with pagination and filters on **all** S1 identity-card fields (`firstName`, `lastName`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDate`, `companyJoinDate`, `ttId`, `isActive`). The full §4.1 "All Employees" feature set — dynamic custom-fields filtering, saved views, export, inline editing, colleague-mode whitelist columns — stays explicitly out of scope for this PRD; only enough of the list endpoint exists to satisfy NFR-2 and give AD-14's `GET /users` route a real implementation.

### NonFunctional Requirements

Drawn from `project-requirements.md` §7, filtered to what binds `user-management` specifically:

- NFR-1 *[§7 "Personal data"]*: `User` holds personal data of real people (`photo`, `birthDate`, `workEmail`, `workPhone`, etc.) — pseudonymised data only in non-production environments; no real personal data in agent contexts, logs, screenshots, or the repository.
- NFR-2 *[§7 "Performance"]*: The `GET /users` list endpoint responds within 2 seconds for 500+ records with arbitrary filters and derived fields, including permission resolution (joint responsibility with access-control's AD-10 tier walk).
- NFR-3 *[§7 "Availability"]*: External integration failures (future timetracker/PeopleForce via `ttId`) degrade gracefully and never take down the application.
- NFR-4 *[§7 "Access control correctness"]*: `user-management`'s endpoints must compose correctly with access-control's audience-filtering (§3.3.4) — response bodies are audience-filtered per viewer; enforcing this is access-control's job via the AccessControl facade (AD-9), but every user-management controller must call through it rather than bypass it.

### Additional Requirements

From the Architecture Spine and its companion docs:

- No starter/greenfield template is specified anywhere in the architecture spine — Epic 1 Story 1 is ordinary scaffolding (NestJS + Prisma per the Stack table), not a named starter kit.
- **AD-1 gate, already at stage 1 for this domain — but unevenly.** 24 stage-1 scenario docs already exist under `docs/test-cases/user-management/` (registration/ 5, auth/ 5, profile/ 4, deactivation/ 3, career-timeline/ 7), status draft, pending developer approval — these cover FR-1 through FR-13 (all of Epic 1's original scope, all of Epic 2, all of Epic 3). Per **AD-4**, there's no centralized test-author role: whoever owns a story writes and gets peer approval on its own scenario doc, then translates to E2E, then codes — no story skips stage 2, and none should re-derive a scenario that already exists in the suite. **Verified gap (checked file-by-file, not just the README summary):** no folder exists for FR-14/FR-15 (mentorship/reports-to relationships — all of Epic 4) or FR-16 (`GET /users` listing, added this session). Their feature owners start stage 1 from a blank page, not a pending-approval draft — a real estimation difference from the rest of this domain.
- **AD-14 router shapes bind every endpoint** this domain builds: the `User` resource itself (`POST /users`, `GET /users`, `GET /users/export` declared *before* `:id`, `GET/PATCH/DELETE /users/:id`, `PUT /users/:id/photo`), the owned `events` collection (`GET/POST /users/:id/events`, `GET/PATCH/DELETE /users/:id/events/:eventId`), and the generic attachment endpoint (`POST/DELETE /users/:id/relationships`) for mentorship (`type: 'mentorship'`) and reports-to (`type: 'direct'`).
- **AD-11 schema migration hazard:** `Relationship`'s 3-armed `CHECK` constraint and its partial `UNIQUE` (`type='direct'` only) have no plain `schema.prisma` representation in Prisma 7.x (verified against 7.9.1) — both must be hand-authored as raw SQL in the migration (`prisma migrate dev --create-only`, then edit `migration.sql`), documented once, not rediscovered per story.
- **AD-2/AD-5 hexagonal layout:** `user-management` uses the standard `application/domain/infrastructure` layout; domain code imports nothing from Prisma, NestJS transport, or HTTP.
- **AD-9:** every entitlement check in this domain's controllers goes through the AccessControl facade (`isAllowed`/tier checks) — never a direct policy-table read or role flag.
- **AD-12 fail-closed bootstrap:** the seed script is the only path that assigns the first HR Admin role; no other path in this domain may grant a role.
- **Explicitly Deferred (per architecture spine) — do not build stories against these yet:** custom-fields storage model (EAV vs JSONB — the `customFields` jsonb column is interim only); Department edge modeling; the S13 mentorship self-visibility flag's exact endpoint (inferred as `PATCH /users/:id/relationships/:id`, not directly sourced); `leaves`/`request-history` write paths (read-only today, no write scenario exists).

### UX Design Requirements

N/A — no UX design contract exists for this domain (no `bmad-ux` run has produced a `DESIGN.md`/`EXPERIENCE.md` pair or legacy UX doc). This section will stay empty unless the user points to one.

### FR Coverage Map

| FR | Epic |
|---|---|
| FR-1 | Epic 1 — seed-script HR Admin bootstrap |
| FR-4 | Epic 1 — HR Admin submits registration on new hire's behalf |
| FR-5 | Epic 1 — HR Admin creates `User` record (S1 fields) |
| FR-6 | Epic 1 — `workEmail`/`ttId` uniqueness on write |
| FR-8 | Epic 1 — entitled actor reads/edits S1 fields; Self writes photo |
| FR-9 | Epic 1 — HR Admin deactivates a `User` (soft delete) |
| FR-16 | Epic 1 — `GET /users` list with pagination + base filters |
| FR-2 | Epic 2 — passwordless magic-link is the sole login mechanism |
| FR-3 | Epic 2 — registration doesn't auto-login, triggers magic-link |
| FR-7 | Epic 2 — request magic link, consume token, establish session |
| FR-10 | Epic 3 — system auto-writes `UserEvents` on tracked change |
| FR-11 | Epic 3 — PP/Manager-line manually add a `UserEvents` entry |
| FR-12 | Epic 3 — PP/Manager-line correct a `UserEvents` entry (soft-delete + append) |
| FR-13 | Epic 3 — soft-deleted `UserEvents` excluded from reads |
| FR-14 | Epic 4 — mentor pairing via generic relationship endpoint |
| FR-15 | Epic 4 — reports-to assignment via generic relationship endpoint |

## Epic List

### Epic 1: Employee Record Lifecycle
HR Admin can onboard a new hire and later deactivate them; every S1 identity-card field is readable/editable by whoever's entitled (Self / Manager-line / PP), with Self able to upload their own photo, and any entitled actor can page through the employee list. Delivered as ordered story-groups (registration → read/edit → photo → deactivation → list) within one epic, since all five sit on the same `User` entity/controller/migration (AD-14 shape 1) and splitting them would only fragment that one surface across epics without adding independent value.
**FRs covered:** FR-1, FR-4, FR-5, FR-6, FR-8, FR-9, FR-16

### Epic 2: Magic-Link Authentication
Any employee created in Epic 1 can request a magic link and log in, establishing the session every other epic's protected endpoints rely on. Own resource (`/auth` root, distinct token entity/service) — no file overlap with Epic 1.
**FRs covered:** FR-2, FR-3, FR-7

### Epic 3: Career Timeline
The system automatically logs tracked changes (join date, position change) as they happen in Epic 1, and PP/Manager-line can manually add or correct entries, with corrections modeled as soft-delete + append rather than in-place edit. Own resource (`UserEvents`/`/users/:id/events`); builds on Epic 1 (mutations fire the auto-write) and Epic 2 (manual add/correct needs an authenticated PP/UM).

**Binding implementation constraint (AD-11):** system-triggered `UserEvents` writes happen synchronously, in the same transaction as the domain mutation that causes them, via an explicit call from that use-case's code — no event bus, no generic table-change listener, no `EventEmitterModule`-style pub/sub, even though NestJS makes that pattern easy to reach for. Every story in this epic that wires a new tracked-change hook follows this same one pattern.

**FRs covered:** FR-10, FR-11, FR-12, FR-13

### Epic 4: Organizational Relationships
HR Admin can set who reports to whom and pair/unpair mentors and mentees — the org-structure facts that access-control's tier resolution and dashboards read downstream. Own resource (`Relationship`/`/users/:id/relationships`, generic attachment shape); builds on Epic 1 (users must exist) and Epic 3 (mentorship attach/detach fires `UserEvents`).
**FRs covered:** FR-14, FR-15

### Epic Sequencing / Parallelization

Per project-requirements.md §8.2 (NORMATIVE, graded): "a situation where one person waits for another is unacceptable." Reading the epic list top-to-bottom as one dependency chain would violate that — but the real build-time dependency is looser than the product narrative suggests, per AD-3 (stage-2 E2E tests bind against fixture-seeded data in the real test DB, not against another epic's live HTTP endpoint):

- **Epic 1 and Epic 2 can be built in parallel** by two different developers. Epic 2's magic-link flow needs a `User` row to exist, not Epic 1's `POST /users` controller — its own test module seeds that row directly via Prisma, the same way every stage-2 suite already works.
- **Epic 3 is a genuine sequence point** — its auto-write hooks attach to Epic 1's own mutation code paths (e.g. `position_change` fires from the same `PATCH /users/:id` handler Epic 1 builds), so it can't start until Epic 1's handlers exist.
- **Epic 4 is a genuine sequence point** on Epic 3 — mentorship attach/detach fires `UserEvents` rows, so it needs Epic 3's write path first.

Net: `{Epic 1, Epic 2}` in parallel, then `Epic 3`, then `Epic 4` — not four serial beads.

## Epic 1: Employee Record Lifecycle

HR Admin can onboard a new hire and later deactivate them; every S1 identity-card field is readable/editable by whoever's entitled (Self / Manager-line / PP), with Self able to upload their own photo, and any entitled actor can page through the employee list. **FRs covered:** FR-1, FR-4, FR-5, FR-6, FR-8, FR-9, FR-16. **Relevant NFRs:** NFR-1 (pseudonymised non-prod data — every fixture below uses fictional personas), NFR-2 (list performance). No UX-DRs (none exist for this domain).

### Story 1.1: HR Admin Registers a New Hire

As a HR Admin,
I want to create a new employee's `User` record on their behalf with their identity-card details,
So that a new hire exists in the system on day one without any self-registration step.

**Acceptance Criteria:**

**Given** a fresh, empty database
**When** the seed script runs
**Then** exactly one `User` row is created and assigned the HR Admin functional role directly, not through this story's endpoint
**And** this bootstrap behavior's own acceptance test lives in access-control's `fc-03` — not duplicated here (FR-1, AD-12)

**Given** Root holds the HR Admin functional role and no existing `User` has Nina's `workEmail`
**When** Root submits `POST /users` with Nina's S1 fields
**Then** the response is `201` with a new `id`, `isActive: true`, and the submitted fields
**And** the body contains no password or credential field (FR-4, FR-5; traces `um-reg-01`)

**Given** Root creates Nina via `POST /users`
**When** the creation succeeds
**Then** the response contains no `accessToken`/`sessionToken`/`Set-Cookie`
**And** a magic-link dispatch fires as a side effect, identical to Nina's future login flow (FR-3; traces `um-reg-05`). Implementation note: registration calls an outbound port for this dispatch — Epic 2 supplies the real adapter later; this story's own E2E test binds the port to a fixture-backed fake per AD-3, so it doesn't block on Epic 2.

**Given** no caller, or one with no valid session token
**When** `POST /users` is requested
**Then** the response is `401` and no row is created (traces `um-reg-02`)

**Given** Ida, authenticated and holding the custom functional role *IT Campaigns* (only permission: *create form campaigns*) but not user creation
**When** Ida attempts `POST /users`
**Then** the response is `403` and no row is created (DEC-UM-002; traces `um-reg-03`)

**Given** an existing `User` with `workEmail: alice@company.example`
**When** Root submits `POST /users` reusing that `workEmail`
**Then** the response is `409` and no new row is created (FR-6; traces `um-reg-04`)

### Story 1.2: View and Edit an Employee's Identity-Card Fields

As an entitled actor (Self / Manager-line / PP, per access-control),
I want to read and edit an employee's S1 identity-card fields,
So that identity data stays accurate as roles, locations, and contact details change.

Entitlement itself is proven in access-control's suite — these ACs assume an already-entitled actor, per this suite's own stated scope boundary.

**Acceptance Criteria:**

**Given** Bob has Manager-line access to Alice (`position: "Engineer"`, `city: "Warsaw"`)
**When** Bob submits `PATCH /users/<aliceId>` with `{ position: "Senior Engineer", city: "Krakow" }`
**Then** the response is `200` reflecting the new values
**And** a subsequent `GET /users/<aliceId>` reflects the same values (FR-8; traces `um-pf-01`)

**Given** Colin exists with `workEmail: colin@company.example`
**When** Bob attempts to `PATCH` Alice's `workEmail` to that address
**Then** the response is `409`
**And** Alice's `workEmail` is unchanged on a follow-up read (FR-6; traces `um-pf-03`)

**Given** Colin exists with `ttId: "tt-1042"` and Alice's `ttId` is `null`
**When** Bob attempts to `PATCH` Alice's `ttId` to `"tt-1042"`
**Then** the response is `409`
**And** Alice's `ttId` stays `null` on a follow-up read (FR-6; traces `um-pf-04`)

### Story 1.3: Self Uploads Own Photo

As an employee,
I want to upload my own profile photo,
So that my identity card shows an accurate photo without anyone else's help.

**Acceptance Criteria:**

**Given** Alice is viewing her own profile (`photo: null`)
**When** Alice submits `PUT /users/<aliceId>/photo` with a new photo file
**Then** the response is `200` with a non-null `photo` reference
**And** a subsequent `GET /users/<aliceId>` reflects the same value (FR-8; traces `um-pf-02`)

### Story 1.4: HR Admin Deactivates an Employee

As a HR Admin,
I want to deactivate an employee's record,
So that someone who has left no longer appears active, without losing their historical data.

**Acceptance Criteria:**

**Given** Root holds the HR Admin functional role and Colin is seeded `isActive: true`
**When** Root submits `DELETE /users/<colinId>`
**Then** the response is `200` reflecting `isActive: false`
**And** a subsequent `GET /users/<colinId>` still returns the full record — not a `404` (FR-9; traces `um-deact-01`, corrected to `DELETE /users/:id` per AD-14)

**Given** Ida, authenticated and holding no deactivation capability (DEC-UM-002)
**When** Ida submits `DELETE /users/<aliceId>`
**Then** the response is `403`
**And** Alice's `isActive` stays `true` on a follow-up read (traces `um-deact-03`, corrected to `DELETE /users/:id`)

The "deactivated user excluded from the active-only list" behavior (`um-deact-02`) belongs to Story 1.5, so this story carries no forward dependency.

### Story 1.5: List Employees with Pagination and Filters

As an entitled actor,
I want to list employees with pagination and filters on identity-card fields,
So that I can find relevant employees without pulling the entire directory.

No scenario doc exists yet for this story (new this session) — **stage-1 scenarios added 2026-08-25** (`um-list-01`..`04`). Scope boundary: filters cover the S1 fields on the `User` row only — no dynamic custom-fields filtering, saved views, export, or inline editing; those stay out of this PRD per §4.1. Subject to NFR-2's 500-record/2s budget, jointly with access-control's tier resolution.

**Acceptance Criteria:**

**Given** more than one page's worth of `User` records exist
**When** an entitled actor submits `GET /users` with pagination params
**Then** the response is `200` with a page of results plus pagination metadata (FR-16)

**Given** `User`s exist with varying `country` values
**When** an entitled actor submits `GET /users?country=Poland`
**Then** every returned record has `country: "Poland"` (FR-16)

**Given** `User`s exist with varying `position`/`city` combinations
**When** an entitled actor submits `GET /users?position=Engineer&city=Krakow`
**Then** every returned record matches both filters (FR-16)

**Given** Colin is seeded `isActive: false`
**When** Root submits `GET /users?isActive=true`
**Then** the result set does not contain Colin's `id` (FR-9/FR-16; traces `um-deact-02`)

## Epic 2: Magic-Link Authentication

Any employee created in Epic 1 can request a magic link and log in, establishing the session every other epic's protected endpoints rely on. **FRs covered:** FR-2, FR-3, FR-7. Own resource (`/auth` root) — no file overlap with Epic 1; can be built in parallel with it (see Epic Sequencing above).

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
**And** a follow-up authenticated request (e.g. `GET /users/<aliceId>`) using that session succeeds with `200` (FR-2, FR-7; traces `um-auth-03`)

**Given** Alice's magic-link token has since expired
**When** Alice submits that expired token to the consume endpoint
**Then** the response is `401` with no session token in the body (traces `um-auth-04`)

**Given** Alice already consumed her magic-link token once
**When** the same token value is submitted again, by anyone
**Then** the response is `401` with no session token in the body — a consumed token is not replayable (traces `um-auth-05`)

**Given** Colin is deactivated (`isActive: false`)
**When** Colin requests a magic link for his `workEmail`
**Then** no usable session is established — request and/or consume returns denial appropriate to the approved security rules (traces `um-auth-06`)

Registration's "does not auto-login" contract (FR-3, Story 1.1 AC3) and this story together complete the full account lifecycle: an account can be created, and separately, logged into — never the former implying the latter.

## Epic 3: Career Timeline

The system automatically logs tracked changes as they happen in Epic 1, and PP/Manager-line can manually add or correct entries, modeled as soft-delete + append rather than in-place edit. **FRs covered:** FR-10, FR-11, FR-12, FR-13. Own resource (`UserEvents`/`/users/:id/events`); builds on Epic 1 (mutations fire the auto-write) and Epic 2 (manual add/correct needs an authenticated PP/UM).

**Binding implementation constraint (AD-11):** system-triggered writes happen synchronously, in the same transaction as the domain mutation that causes them, via an explicit call from that use-case's code — no event bus, no generic table-change listener, no `EventEmitterModule`-style pub/sub. Every story below that wires a new tracked-change hook follows this same pattern.

### Story 3.1: System Auto-Generates Career Timeline Events

As the system,
I want to automatically write a career-timeline event whenever a tracked change happens to a `User`,
So that PP/Manager-line always see an accurate history without anyone remembering to log it by hand.

Only `joined_company` and `position_change` have a triggering code path today — the other six documented `UserEvents` types reference contexts that don't exist yet.

**Acceptance Criteria:**

**Given** Root creates Nina via `POST /users` (Story 1.1)
**When** the creation succeeds
**Then** a `UserEvents` row is written for Nina with `type: "joined_company"`, `source: "system"`, `eventDate` matching her `companyJoinDate`
**And** no separate request is needed to produce it (FR-10; traces `um-ct-01`)

**Given** Alice currently has `position: "Engineer"`
**When** Bob edits Alice's `position` to `"Senior Engineer"` via `PATCH /users/<aliceId>` (Story 1.2)
**Then** a `UserEvents` row is written for Alice with `type: "position_change"`, `source: "system"`, `details: { from: "Engineer", to: "Senior Engineer" }` (FR-10; traces `um-ct-02`)

### Story 3.2: Assigned PP and Direct UM Manually Add a Backfill Entry

As an assigned People Partner or the employee's direct Unit Manager,
I want to manually add a career-timeline entry,
So that I can backfill history that predates the system (the legacy Excel headcount record).

**Binding rule (DEC-UM-001):** Manual write is limited to assigned PP and direct UM. Full Manager line and PP may read; project-derived DM/PM and transitive managers are read-only for manual mutation.

**Acceptance Criteria:**

**Given** Paula is Alice's people partner
**When** Paula submits `POST /users/<aliceId>/events` with a `mentorship_end` entry dated before the system existed
**Then** the response is `201` with `source: "manual"`
**And** the entry appears on a subsequent `GET /users/<aliceId>/events` (FR-11; traces `um-ct-03`)

**Given** Bob is Alice's unit manager
**When** Bob submits `POST /users/<aliceId>/events` with a backfill entry
**Then** the response is `201` with `source: "manual"`
**And** the entry appears on a subsequent read — proving the direct UM actor under DEC-UM-001 (FR-11; traces `um-ct-04`)

### Story 3.3: PP/Manager-Line Corrects or Deletes an Event

As a People Partner or Manager-line,
I want to correct a wrongly-inferred event or delete one that shouldn't exist,
So that the timeline stays accurate without ever rewriting history in place.

**Acceptance Criteria:**

**Given** Alice has a system-generated `position_change` event with a wrong `details.to` value
**When** Paula submits `DELETE /users/<aliceId>/events/<wrongEventId>`, then `POST /users/<aliceId>/events` with the corrected `type`/`eventDate`/`details`
**Then** the delete returns `200`, the append returns `201` with a new event id distinct from `<wrongEventId>`
**And** a subsequent read shows the typo'd entry absent and the corrected entry present (FR-12; traces `um-ct-05`)

**Given** a manually-added event on Alice's timeline that turns out to need no replacement
**When** Bob submits `DELETE /users/<aliceId>/events/<eventId>`
**Then** the response is `200` and the row is soft-deleted (`deletedAt` set, not removed) (FR-12; traces `um-ct-06`)

**Given** the event Bob just deleted
**When** Alice's career timeline is read
**Then** the deleted event does not appear at all — not null, not exposing `deletedAt`, simply absent (FR-13; traces `um-ct-07`)

## Epic 4: Organizational Relationships

HR Admin can set who reports to whom and pair/unpair mentors and mentees — the org-structure facts access-control's tier resolution and dashboards read downstream. **FRs covered:** FR-14, FR-15. Own resource (`Relationship`/`/users/:id/relationships`, generic attachment shape); builds on Epic 1 (users must exist) and Epic 3 (mentorship attach/detach fires `UserEvents`).

No scenario docs existed for either story — **stage-1 scenarios added 2026-08-25** (`um-rel-01`..`08`).

### Story 4.1: HR Admin Assigns or Revokes Reports-To

As a HR Admin,
I want to assign or revoke who an employee reports to,
So that the org's management hierarchy reflects reality — no external sync exists for this (FR-15).

**Design decision (DEC-UM-005, approved 2026-08-25):** Reassigning an employee who already has an active reports-to edge requires explicit **`DELETE` then `POST`**. A second `POST` while a direct edge exists returns **`409`**. Traces: `um-rel-01`..`03`.

**Acceptance Criteria:**

**Given** Alice has no active reports-to edge
**When** Root submits `POST /users/<aliceId>/relationships` with `{ type: 'direct', targetId: <bobId> }`
**Then** the response is `201` and a `Relationship` row is created (`type: 'direct'`, `userId: aliceId`, `reportsToUserId: bobId`)

**Given** Alice already has an active reports-to edge to Bob
**When** Root submits `POST /users/<aliceId>/relationships` with `{ type: 'direct', targetId: <paulaId> }` without first revoking the existing edge
**Then** the response is `409` — reports-to is a tree, not a graph (AD-11)

**Given** Alice has an active reports-to edge to Bob
**When** Root submits `DELETE /users/<aliceId>/relationships/<relationshipId>`
**Then** the response is `200`, the row is hard-deleted (no soft delete on `Relationship`, per AD-11)
**And** a subsequent read shows Alice with no manager

**Given** Colin holds no HR Admin functional role
**When** Colin submits `POST /users/<aliceId>/relationships` with `type: 'direct'`
**Then** the response is `403`

### Story 4.2: HR Admin Pairs or Unpairs a Mentor and Mentee

As a HR Admin,
I want to pair or unpair a mentor and a mentee,
So that mentorship relationships are tracked and the pairing fires the right career-timeline events (FR-14). Status tracking beyond active/ended and notifications stay out of scope — future `mentorship` bounded context.

**Acceptance Criteria:**

**Given** Alice has no active mentorship edge
**When** Root submits `POST /users/<aliceId>/relationships` with `{ type: 'mentorship', targetId: <paulaId> }`
**Then** the response is `201`, a `Relationship` row is created (`type: 'mentorship'`, `userId: aliceId` as mentee, `reportsToUserId: paulaId` as mentor)
**And** a `UserEvents` row is written for Alice with `type: 'mentorship_start'`, `source: 'system'` (ties into Epic 3's write mechanism)

**Given** Alice already has an active mentorship edge to Paula
**When** Root submits `POST /users/<aliceId>/relationships` with `{ type: 'mentorship', targetId: <anotherMentorId> }`
**Then** the response is `201` — unlike reports-to, mentorship carries no one-at-a-time uniqueness constraint (AD-11, explicitly left unconstrained)

**Given** Alice has an active mentorship edge to Paula
**When** Root submits `DELETE /users/<aliceId>/relationships/<relationshipId>`
**Then** the response is `200`, the row is hard-deleted
**And** a `UserEvents` row is written for Alice with `type: 'mentorship_end'`, `source: 'system'`

**Given** Colin holds no HR Admin functional role
**When** Colin submits `POST /users/<aliceId>/relationships` with `type: 'mentorship'`
**Then** the response is `403`

A `mentorship` edge grants no access tier (AD-11) — that negative assertion belongs to access-control's suite, not duplicated here.
