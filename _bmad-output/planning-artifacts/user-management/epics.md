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

Supporting sources folded in for precise, testable acceptance criteria (endpoint shapes, field names, persona names): [api-conventions.md](../../../../docs/architecture/api-conventions.md), [database-schema.md](../../../../docs/architecture/database-schema.md), and the existing stage-1 AD-1 scenario docs at [docs/test-cases/user-management/](../../../../docs/test-cases/user-management/README.md) (24 files, status: draft, pending developer approval).

## Requirements Inventory

### Functional Requirements

**Explicitly numbered in the PRD ("Functional Requirements — Account & Authentication"):**

- FR-1: The very first `User` in the system is created by a seed script and assigned the HR Admin functional role directly (AD-12 bootstrap) — not through the registration flow below.
- FR-2: Authentication is passwordless: a magic link sent to `workEmail` is the sole login mechanism (temporary, ahead of SSO). No password is ever stored.
- FR-3: Completing the registration form does not log the user in directly — it triggers the same magic-link email used for every subsequent login. There is no separate "invite link" mechanism.
- FR-4: HR Admin submits the registration form on the new hire's behalf (not self-registration). `isActive` alone is sufficient — no intermediate "not yet activated" state; HR-Admin-entered records go straight to `isActive: true` and the magic link (FR-3) is the activation-equivalent step.

**Derived from the PRD's Scope / Data Model prose (not literally numbered FR-n in the source, but stated as in-scope capability) and cross-checked against the existing test-case folders — sourced, not invented:**

- FR-5 *[PRD Scope + Data Model — User entity table; test-cases/registration/]*: HR Admin can create a `User` record with the S1 identity-card fields (`firstName`, `lastName`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`, `photo`, `ttId`). Birthday is two separate fields (day 1-31, month 1-12), no year — §3.2 S1 content is literally "birthday (day and month)"; supersedes an earlier single-`birthDate`-with-year design (resolved 2026-08-25).
- FR-6 *[PRD Data Model — `workEmail`/`ttId` notes; test-cases README "uniqueness constraints on write"]*: `workEmail` and `ttId` are enforced unique at write time (registration and profile edit).
- FR-7 *[PRD FR-2 mechanics; test-cases/auth/]*: A user can request a magic link by `workEmail` and consume the returned token to establish a session.
- FR-8 *[PRD Data Model — "the one Self-writable identity-card field per §3.2"; test-cases/profile/]*: An entitled actor (Self / Manager-line / PP, per access-control) can read and edit S1 identity-card fields via `GET`/`PATCH /users/:id`; `photo` is the one field Self can write directly, via `PUT /users/:id/photo`.
- FR-9 *[PRD Data Model — `User.isActive`; test-cases/deactivation/]*: HR Admin can deactivate a `User` (`DELETE /users/:id`), flipping `isActive` to `false`; the record is preserved and excluded from active-only views. **Note (resolved 2026-08-25):** project-requirements.md never describes a deactivation feature or an active/inactive status anywhere in §1-10 — `isActive` is a technical soft-delete necessity (`UserEvents`/`Relationship` rows reference `User` by FK and must stay valid after someone leaves), not a sourced business requirement, and is distinct from S4's sourced "employment status" field (unbuilt/deferred). Product decision: keep `isActive` as-is on that basis.
- FR-10 *[PRD §4.9 + Data Model — UserEvents; test-cases/career-timeline/]*: The system automatically writes a `UserEvents` entry when a tracked change happens to a `User` — currently wired for `joined_company` and `position_change` only (the other six documented types have no triggering context yet, per the test-case suite's own scope note).
- FR-11: Assigned PP and direct UM can manually add a `UserEvents` entry for historical backfill.
- FR-12: Assigned PP and direct UM can correct a wrongly-inferred `UserEvents` entry by soft-deleting the wrong entry and appending a new corrected one — never an in-place edit.
- FR-13 *[test-cases/README Conventions — "Absence is absence"]*: A soft-deleted `UserEvents` entry is excluded from reads, never returned with a null/placeholder body.
- FR-14 *[PRD Scope — "the pairing fact itself is in scope"; AD-11]*: Mentor pairing is attached/detached via `POST`/`DELETE /users/:id/relationships` (`type: 'mentorship'`), which fires the `mentorship_start`/`mentorship_end` `UserEvents` entries.
- FR-15: Reports-to assignment has no external sync. A holder of the change-organisational-relationships permission assigns/revokes manager via `POST`/`DELETE /users/:id/relationships` (`type: 'direct'`), same mechanism as mentorship (FR-14).

Project-relationship assignment (`type: 'project'`) stays separately and explicitly out of scope ("Department and Project administration — platform scope; project membership from timetracker sync (§5.1); department per §4.17").

- FR-16 *[User decision 2026-08-22, closing a gap PRD scope left open; project-requirements.md §4.1 + NFR-2 + AD-14 route table]*: An entitled actor can list `User`s via `GET /users` with pagination and filters on **all** S1 identity-card fields (`firstName`, `lastName`, `position`, `country`, `city`, `workEmail`, `workPhone`, `birthDay`, `birthMonth`, `companyJoinDate`, `ttId`, `isActive`). The full §4.1 "All Employees" feature set — dynamic custom-fields filtering, saved views, export, inline editing, colleague-mode whitelist columns — stays explicitly out of scope for this PRD; only enough of the list endpoint exists to satisfy NFR-2 and give AD-14's `GET /users` route a real implementation.

### NonFunctional Requirements

Drawn from `project-requirements.md` §7, filtered to what binds `user-management` specifically:

- NFR-1 *[§7 "Personal data"]*: `User` holds personal data of real people (`photo`, `birthDay`/`birthMonth`, `workEmail`, `workPhone`, etc.) — pseudonymised data only in non-production environments; no real personal data in agent contexts, logs, screenshots, or the repository.
- NFR-2 *[§7 "Performance"]*: The `GET /users` list endpoint responds within 2 seconds for 500+ records with arbitrary filters and derived fields, including permission resolution (joint responsibility with access-control's AD-10 tier walk).
- NFR-3 *[§7 "Availability"]*: External integration failures (future timetracker/PeopleForce via `ttId`) degrade gracefully and never take down the application.
- NFR-4 *[§7 "Access control correctness"]*: `user-management`'s endpoints must compose correctly with access-control's audience-filtering (§3.3.4) — response bodies are audience-filtered per viewer; enforcing this is access-control's job via the AccessControl facade (AD-9), but every user-management controller must call through it rather than bypass it.

### Additional Requirements

From the Architecture Spine and its companion docs:

- No starter/greenfield template is specified anywhere in the architecture spine — Epic 1 Story 1 is ordinary scaffolding (NestJS + Prisma per the Stack table), not a named starter kit.
- **AD-1 gate:** stage-1 scenario docs under `docs/test-cases/user-management/` per story ownership.
- **AD-14 router shapes bind every endpoint** this domain builds: the `User` resource (`GET /users`, `GET /users/export` before `:id`, `GET/PATCH/DELETE /users/:id`, `PUT /users/:id/photo` — no `POST /users`, §4.17), `events` collection, and `POST/DELETE /users/:id/relationships` for mentorship and reports-to.
- **AD-11 schema migration hazard:** `Relationship`'s 3-armed `CHECK` constraint and its partial `UNIQUE` (`type='direct'` only) have no plain `schema.prisma` representation in Prisma 7.x (verified against 7.9.1) — both must be hand-authored as raw SQL in the migration (`prisma migrate dev --create-only`, then edit `migration.sql`), documented once, not rediscovered per story.
- **AD-2/AD-5 hexagonal layout:** `user-management` uses the standard `application/domain/infrastructure` layout; domain code imports nothing from Prisma, NestJS transport, or HTTP.
- **AD-9:** every entitlement check in this domain's controllers goes through the AccessControl facade (`isAllowed`/tier checks) — never a direct policy-table read or role flag.
- **AD-12 fail-closed bootstrap:** the seed script is the only path that assigns the first HR Admin role; no other path in this domain may grant a role.
- **Explicitly Deferred (per architecture spine) — do not build stories against these yet:** custom-fields storage model (EAV vs JSONB — the `customFields` jsonb column is interim only); the S13 mentorship self-visibility flag's exact endpoint; `leaves`/`request-history` write paths (read-only today, no write scenario exists).

### UX Design Requirements

N/A — no UX design contract exists for this domain (no `bmad-ux` run has produced a `DESIGN.md`/`EXPERIENCE.md` pair or legacy UX doc). This section will stay empty unless the user points to one.

### FR Coverage Map

| FR | Epic |
|---|---|
| FR-1 | Epic 1 — seed-script HR Admin bootstrap + population import |
| FR-4a | Epic 1 — seeded population import (no HTTP create) |
| FR-5a | Epic 1 — S1 fields at import; `joined_company` at seed |
| FR-6 | Epic 1 — `workEmail`/`ttId` uniqueness on write |
| FR-8 | Epic 1 — entitled actor reads/edits S1 fields; Self writes photo |
| FR-9 | Epic 1 — deactivation capability soft-deletes a `User` |
| FR-16 | Epic 1 — `GET /users` list with pagination + base filters |
| FR-2 | Epic 2 — passwordless magic-link is the sole login mechanism |
| FR-3 | Epic 2 — first login uses magic-link (no registration auto-login) |
| FR-7 | Epic 2 — request magic link, consume token, establish session |
| FR-10 | Epic 3 — system auto-writes `UserEvents` on tracked change |
| FR-11 | Epic 3 — assigned PP / direct UM manually add timeline entry |
| FR-12 | Epic 3 — assigned PP / direct UM correct timeline entry |
| FR-13 | Epic 3 — soft-deleted `UserEvents` excluded from reads |
| FR-14 | Epic 4 — mentor pairing via generic relationship endpoint |
| FR-15 | Epic 4 — reports-to assignment via generic relationship endpoint |

## Epic List

### Epic 1: Employee Record Management
Authorized actors can manage existing employee records; population arrives via seed import only (§4.17). Every S1 identity-card field is readable/editable by entitled actors (Self / Reporting line / Project line / PP), with Self able to upload their own photo, and any entitled actor can page through the employee list.
**FRs covered:** FR-1, FR-4a, FR-5a, FR-6, FR-8, FR-9, FR-16

### Epic 2: Magic-Link Authentication
Any employee in the imported population can request a magic link and log in, establishing the session every other epic's protected endpoints rely on.
**FRs covered:** FR-2, FR-3, FR-7

### Epic 3: Career Timeline
The system automatically logs tracked changes as they happen in Epic 1, and assigned PP and direct UM can manually add or correct entries, with corrections modeled as soft-delete + append rather than in-place edit.

**Binding implementation constraint (AD-11):** system-triggered `UserEvents` writes happen synchronously, in the same transaction as the domain mutation that causes them, via an explicit call from that use-case's code — no event bus, no generic table-change listener, no `EventEmitterModule`-style pub/sub, even though NestJS makes that pattern easy to reach for. Every story in this epic that wires a new tracked-change hook follows this same one pattern.

**FRs covered:** FR-10, FR-11, FR-12, FR-13

### Epic 4: Organizational Relationships
Holders of the change-organisational-relationships permission assign reports-to and mentorship edges — org-structure facts that access-control tier resolution reads downstream.
**FRs covered:** FR-14, FR-15

### Epic Sequencing / Parallelization

Per project-requirements.md §8.2 (NORMATIVE, graded): "a situation where one person waits for another is unacceptable." Reading the epic list top-to-bottom as one dependency chain would violate that — but the real build-time dependency is looser than the product narrative suggests, per AD-3 (stage-2 E2E tests bind against fixture-seeded data in the real test DB, not against another epic's live HTTP endpoint):

- Epic 2's magic-link flow needs a `User` row to exist, not Epic 1's HTTP surface — its test module seeds via Prisma or the population import script.
- **Epic 3 is a genuine sequence point** — its auto-write hooks attach to Epic 1's own mutation code paths (e.g. `position_change` fires from the same `PATCH /users/:id` handler Epic 1 builds), so it can't start until Epic 1's handlers exist.
- **Epic 4 is a genuine sequence point** on Epic 3 — mentorship attach/detach fires `UserEvents` rows, so it needs Epic 3's write path first.

Net: `{Epic 1, Epic 2}` in parallel, then `Epic 3`, then `Epic 4` — not four serial beads.

## Epic 1: Employee Record Management

Entitled actors manage employee records over the imported population (§4.17): read/edit S1 fields (Self / Reporting line / Project line / PP), self photo upload, deactivation via capability, and paginated list.
**FRs covered:** FR-1, FR-4a, FR-5a, FR-6, FR-8, FR-9, FR-16

### Story 1.1: Import Seeded Population

As the system operator,
I want the employee population imported from the seeded timetracker list,
So that all features operate over a fixed set of users without any creation, AD, or SSO provisioning flow.

**Acceptance Criteria:**

**Given** a fresh, empty database
**When** the seed script runs
**Then** exactly one `User` row is created and assigned the HR Admin functional role directly, not through this story's endpoint
**And** this bootstrap behavior's own acceptance test is specified to live in access-control's `fc-03` — not duplicated here (FR-1, AD-12). **Note (2026-08-25):** the access-control test-case suite is not yet authored on disk; until it exists, this bootstrap behavior has no approved scenario anywhere.

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

**Given** Root, entitled to create users
**When** Root submits a payload missing one or more non-nullable S1 columns (`firstName`, `lastName`, `position`, `country`, `city`, `workEmail`, `companyJoinDate`)
**Then** the response is `400` naming the missing fields, not a `500` from a database constraint (traces `um-reg-06`)

**Given** Root, and Colin already holding `ttId: "tt-1042"`
**When** Root submits a registration payload reusing that `ttId`
**Then** the response is `409` and no new row is created; the constraint holds on create the same way `um-pf-04` proves it holds on edit (FR-6; traces `um-reg-07`)

**Given** Root, and no existing user on Nina's `workEmail`
**When** two `POST /users` requests for that address are submitted concurrently
**Then** exactly one `201` and one `409` result, never two `201`s and never a `500` — the database constraint is the arbiter when both requests clear the application's uniqueness read together (FR-6, AD-5; traces `um-reg-08`)

**Given** Root, entitled to create users
**When** Root submits a payload with a malformed `workEmail` and every other field valid
**Then** the response is `400` naming `workEmail` (traces `um-reg-09`)

**Given** Root
**When** Root submits a payload with a client-supplied `id`, `createdAt`, or `createdBy`
**Then** the response is `400` — the server does not silently strip caller-supplied audit or identity fields (DEC-UM-006; traces `um-reg-10`)

**Given** Colin exists with `workEmail: colin@company.example` (normalized storage)
**When** Root submits a create or collision payload using whitespace or casing variants of that address
**Then** normalization applies before validation, storage, lookup, and uniqueness — the variant resolves to `409`, not a second row (DEC-UM-007; traces `um-reg-11`)

**Given** Colin was deactivated and retains his original `workEmail`
**When** Root submits `POST /users` with the same normalized email, simulating a mistaken "new hire" registration for a returning employee
**Then** no second `User` row is created for that normalized email — identity and history stay on Colin's original row (DEC-UM-009; traces `um-reg-12`)

**Given** Root creates a new hire and the transaction commits the `User`, `joined_company` event, and durable dispatch intent
**When** the outbound email transport throws after the transaction commits
**Then** the response is still `201`, the `User` and `joined_company` event survive, and delivery state is observable as pending/failed and retryable — registration does not roll back (DEC-UM-008, NFR-3; traces `um-reg-13`)

**Given** Root, entitled to create users
**When** Root submits a payload with both `birthDay` and `birthMonth` set to valid values
**Then** the response reflects both values exactly as submitted, with no year captured or invented (traces `um-reg-14`)

**Given** Root, entitled to create users
**When** Root submits a payload where `birthDay`/`birthMonth` are only partially supplied, or either value is out of its valid range (`birthDay` 1-31, `birthMonth` 1-12)
**Then** the response is `400` naming the offending field, and no row is created (traces `um-reg-15`)

### Story 1.2: View and Edit an Employee's Identity-Card Fields

As an entitled actor —Manager-line or PP, holding `RW` on S1 per requirements §3.2— I want to read and edit an employee's S1 identity-card fields, so that identity data stays accurate as roles, locations, and contact details change. **Self holds `R (photo RW)` on S1 per §3.2**: Self reads their own S1 fields but does not have general PATCH-write access to them — Self's only direct write path is the `photo` field, covered separately by Story 1.3. (Corrected 2026-08-25: this story previously listed Self alongside Manager-line/PP as edit-entitled, which overstated Self's write access; the test suite under `profile/` already reflects the correct RW split by testing only Bob/Manager-line against `PATCH /users/:id`.)

Entitlement itself is proven in access-control's suite — these ACs assume an already-entitled actor, per this suite's own stated scope boundary.

**Acceptance Criteria:**

**Given** Bob has reporting-line access to Alice (`position: "Engineer"`, `city: "Warsaw"`)
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

### Story 1.4: Deactivate an Employee

As a holder of the deactivation capability,
I want to deactivate an employee's record,
So that someone who has left no longer appears active, without losing their historical data.

**Acceptance Criteria:**

**Given** Root holds the deactivation capability and Colin is seeded `isActive: true`
**When** Root submits `DELETE /users/<colinId>`
**Then** the response is `200` reflecting `isActive: false`
**And** a subsequent `GET /users/<colinId>` still returns the full record — not a `404` (FR-9; traces `um-deact-01`)

**Given** Ida, authenticated and holding no deactivation capability
**When** Ida submits `DELETE /users/<aliceId>`
**Then** the response is `403`
**And** Alice's `isActive` stays `true` on a follow-up read (traces `um-deact-03`)

The deactivated-user excluded from active-only list behavior (`um-deact-02`) belongs to Story 1.5.

### Story 1.5: List Employees with Pagination and Filters

As an entitled actor,
I want to list employees with pagination and filters on identity-card fields,
So that I can find relevant employees without pulling the entire directory.

Scope: S1-field filters on the `User` row only — not custom-fields, saved views, export, or inline editing (§4.1 out of scope for this PRD).

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

Any employee in the imported population can request a magic link and log in. **FRs covered:** FR-2, FR-3, FR-7.

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
**Then** no usable session is established — request and/or consume returns denial appropriate to the approved security rules (traces `um-auth-06`). **Note:** the request-side enumeration-safety half of this (a deactivated email gets the same generic response as an unknown one) is governed by DEC-UM-012, proposed 2026-08-25 and not part of the DEC-UM-001..011 set the product owner has approved — confirm it before treating it as settled. The consume-side half (a pre-deactivation token fails at consume) is not in question.

First login uses the magic-link flow (FR-3) — import does not establish a session.

## Epic 3: Career Timeline

The system automatically logs tracked changes from Epic 1; assigned PP and direct UM manually add or correct entries (soft-delete + append). **FRs covered:** FR-10, FR-11, FR-12, FR-13.

**Binding implementation constraint (AD-11):** system-triggered writes happen synchronously, in the same transaction as the domain mutation that causes them, via an explicit call from that use-case's code — no event bus, no generic table-change listener, no `EventEmitterModule`-style pub/sub. Every story below that wires a new tracked-change hook follows this same pattern.

### Story 3.1: System Auto-Generates Career Timeline Events

As the system,
I want to automatically write a career-timeline event whenever a tracked change happens to a `User`,
So that reporting line and PP always see an accurate history without anyone remembering to log it by hand.

Only `joined_company` and `position_change` have a triggering code path today — the other six documented `UserEvents` types reference contexts that don't exist yet.

**Acceptance Criteria:**

**Given** the seed/import completed for employee Nina (Story 1.1)
**When** Nina's career timeline is read
**Then** a `UserEvents` row exists with `type: "joined_company"`, `source: "system"`, `eventDate` matching her `companyJoinDate` — written at import time, not via HTTP create (FR-10; traces `um-ct-01`)

**Given** the seed population includes Alice with `position: "Engineer"`
**When** Bob edits Alice's `position` to `"Senior Engineer"` via `PATCH /users/<aliceId>` (Story 1.2)
**Then** a `UserEvents` row is written for Alice with `type: "position_change"`, `source: "system"`, `details: { from: "Engineer", to: "Senior Engineer" }` (FR-10; traces `um-ct-02`)

### Story 3.2: Assigned PP and Direct UM Manually Add a Backfill Entry

As an assigned People Partner or the employee's direct Unit Manager,
I want to manually add a career-timeline entry,
So that I can backfill history that predates the system (the legacy Excel headcount record).

**Binding rule (DEC-UM-001):** Manual write is limited to assigned PP and direct UM. Reporting line and project line may read; project-derived managers are read-only for manual mutation.

**Acceptance Criteria:**

**Given** Paula is Alice's people partner
**When** Paula submits `POST /users/<aliceId>/events` with a `mentorship_end` entry dated before the system existed
**Then** the response is `201` with `source: "manual"`
**And** the entry appears on a subsequent `GET /users/<aliceId>/events` (FR-11; traces `um-ct-03`)

**Given** Bob is Alice's unit manager
**When** Bob submits `POST /users/<aliceId>/events` with a backfill entry
**Then** the response is `201` with `source: "manual"`
**And** the entry appears on a subsequent read — proving the direct UM actor under DEC-UM-001 (FR-11; traces `um-ct-04`)

### Story 3.3: PP or Direct UM Corrects or Deletes an Event

As an assigned People Partner or the employee's direct Unit Manager,
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

Holders of the change-organisational-relationships permission assign reports-to and mentorship edges. **FRs covered:** FR-14, FR-15.

### Story 4.1: Assign or Revoke Reports-To

As a holder of the change-organisational-relationships permission,
I want to assign or revoke who an employee reports to,
So that the org's management hierarchy reflects reality — no external sync exists for this (FR-15).

**Design decision (DEC-UM-005):** Reassigning an employee who already has an active reports-to edge requires explicit **`DELETE` then `POST`**. A second `POST` while a direct edge exists returns **`409`**. Traces: `um-rel-01`..`03`.

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

**Given** Colin lacks the change-organisational-relationships permission
**When** Colin submits `POST /users/<aliceId>/relationships` with `type: 'direct'`
**Then** the response is `403`

### Story 4.2: Pair or Unpair a Mentor and Mentee

As a holder of the change-organisational-relationships permission,
I want to pair or unpair a mentor and a mentee,
So that mentorship relationships are tracked and the pairing fires the right career-timeline events (FR-14). Status tracking beyond active/ended and notifications stay out of scope — future `mentorship` bounded context.

> ⚠️ **TEMPORARY DEVIATION FROM SOURCE (product decision 2026-08-25) — reopen once policies/manager-relationship access is wired.** §4.11 explicitly assigns pair/unpair authority to *"manager and PP,"* and §2.2 lists *"mentorship assignment"* as a named Unit Manager feature, and §2.3 lists *"assign mentors"* as an independently grantable functional-role permission — none of that is HR-Admin-exclusive in the source. This story gates both actions to the HR Admin functional role only, as a **temporary** simplification, because the mechanisms that would let UM/PP hold this capability against their own access scope don't exist yet in this iteration: the AD-7 policies engine (FR grants + AR-scoped enforcement) and the `Relationship`-derived Manager-line walk (AD-10) aren't wired into `AccessControl` together yet. **Once both land, this must be reopened** to grant "assign mentors" to UM/PP per source, scoped to their own Manager-line/PP relationship to the mentee — not left as HR-Admin-only permanently.
>
> ⚠️ **OPEN QUESTION, not implemented this story — flag for future clarification.** §4.11 also states: *"final feedback on the mentorship is required to close it — a pair cannot be ended without it."* This story's unpair flow does **not** implement that requirement. The actor is settled — a manager or PP performs the unpair (source; matches this story's actor) — so the open question isn't who submits the feedback. It's the *subject*: is it the manager/PP's assessment of the mentorship's outcome, feedback on the mentor's performance, feedback on the mentee's experience/growth, or something else — each implies a different field shape, and guessing wrong would need to be unwound later. Do not add a feedback field to this story's `DELETE` flow until that's resolved with a human.

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

**Given** Colin lacks the change-organisational-relationships permission
**When** Colin submits `POST /users/<aliceId>/relationships` with `type: 'mentorship'`
**Then** the response is `403`

A `mentorship` edge grants no access tier (AD-11) — that negative assertion belongs to access-control's suite, not duplicated here.
