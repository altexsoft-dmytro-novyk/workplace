# Epic 3 Context: Career Timeline

<!-- Regenerated 2026-09-01 from epics.md v1.5 — supersedes the pre-v1.5 version; NOT an AD-1 approval. -->
<!-- Compiled planning context for a future story-authoring / dev pass. NOT an AD-1 stage-1 scenario doc. -->

## Goal

The `UserEvents` career-timeline log: the system writes an event whenever a
tracked change happens on a `User`, and an authorized actor can manually add,
edit, or delete an event for historical backfill/correction. **FRs covered:**
FR-11, FR-12, FR-13.

## Stories

- Story 3.1: System Auto-Generates Career Timeline Events
- Story 3.2: Authorized Actor Manually Adds a Backfill Entry
- Story 3.3: Authorized Actor Edits or Deletes an Event

*(v1.5 story titles. The pre-v1.5 "PP/Manager-Line…" titles are retired — see the
SUPERSEDED pointer files `spec-3-2-pp-manager-line-manually-adds-a-backfill-entry.md`
and `spec-3-3-pp-manager-line-corrects-or-deletes-an-event.md`.)*

## Requirements & Constraints

- **v1.5 automatic event set (FR-11).** The system generates `joined_company`,
  `grade_change`, `position_change`, `department_change`,
  `employment_type_change`, `extended_leave`, `mentorship_start`,
  `mentorship_end`. `joined_company` fires at **import** (Story 1.1),
  `position_change` from the `PATCH /users/:id` handler (Story 1.2),
  `department_change` from Epic 4 Story 4.3. The others are appended by their
  owning contexts (grade, employment-type, leave, mentorship) through the User
  Management application boundary — do not build system hooks for contexts that
  don't exist yet. **Departure is not a career-timeline event** — employment
  status is the sole source.
- **Manual add / edit / delete gate (FR-12, DEC-UM-001).** This is the §2.2
  dual gate plus a §3.3 matrix exception: the actor needs **both** the runtime
  *edit the career timeline* permission **and** the narrowed **S9 write
  audience** — the **assigned People Partner** or the employee's **direct Unit
  Manager** (the manager of the employee's department, §4.17). The full
  reporting/project line and transitive managers may *read* S9 but are
  **read-only** for manual mutation. Both halves are checked through the
  `AccessControlPort` facade's target-scoped check — never inline role logic.
- A correction is **never** an in-place edit: soft-delete the wrong entry
  (`DELETE /users/:id/events/:eventId` → `deletedAt` set), then append a new one
  (`POST /users/:id/events`). Both rows persist; only the wrong one drops out of
  reads. A soft-deleted entry is absent from `GET /users/:id/events` entirely,
  never exposing `deletedAt`.
- `UserEvents` rows are immutable facts once written — no field mutates after
  creation except `deletedAt` going `null` → timestamp.
- **AD-11 binding constraint.** System-triggered writes happen **synchronously,
  in the same transaction** as the domain mutation that causes them, via an
  **explicit call** from that use-case's code — no event bus, no generic
  table-change listener, no `EventEmitterModule`-style pub/sub. Every story that
  wires a new tracked-change hook follows this one pattern (Story 3.1
  establishes it; Epic 4 Stories 4.2/4.3 reuse it).
- This suite covers workflow/data correctness only; entitlement mechanics
  themselves are access-control's own suite's job.
- NFR-1 pseudonymised data only.

## Technical Decisions

- `UserEvents` per `database-schema.md`: `id` (uuidv7 PK), `userId` (FK →
  `User`), `type` (string, not a DB enum — the eight tracked values are
  examples), `eventDate` (date), `details` (jsonb, type-specific payload —
  `department_change` / `mentorship_start/end` reference ids from contexts that
  don't exist yet, reserved), `source` (`'system' | 'manual'`), `deletedAt`
  (nullable timestamp), `createdAt`, `createdBy` (FK → `User`). Adding this
  model + migration is **Story 3.1's job**; 3.2/3.3 do not re-derive or alter
  it.
- Router (AD-14, `api-conventions.md` shape 2, owned collection):
  `POST /users/:id/events`, `GET /users/:id/events` (excludes soft-deleted),
  `DELETE /users/:id/events/:eventId` (soft-delete). **No `PATCH`** on a single
  event — correction is soft-delete + append by design.
- Standard hexagonal layout; domain imports nothing from Prisma/NestJS/HTTP.
- The manual-add write path (Story 3.2) is reused as-is by Story 3.3's "append
  the corrected entry" step — 3.3 adds only the soft-delete path.
- The DTO stamps `source` server-side on the normal write path; whether
  `CreateUserEventDto` accepts an incoming `source` at all (rejected by
  `whitelist` vs accepted-and-overridden) is an open call for Story 3.2's
  scenario stage.

## Cross-Story / Cross-Epic Dependencies

- **Story 3.1 is a genuine sequence point on Epic 1.** Its auto-write hooks call
  out from inside Story 1.1's import path and Story 1.2's `PATCH /users/:id`
  handler — those must exist as real, mergeable code first. Not parallelizable
  with Epic 1.
- Stories 3.2/3.3 need authenticated PP/UM sessions on the manual paths —
  builds on Epic 2. Story 3.1's system writes ride inside an already-
  authenticated request and need no separate auth.
- Epic 4 Stories 4.2 (`mentorship_start/end` — but see Epic 4 context: the v1.5
  4.2 is People Partner, and `mentorship_*` events are appended by the future
  Mentorship context) and 4.3 (`department_change`) call Story 3.1's
  synchronous same-transaction write mechanism.
- An existing stage-2-only E2E file
  (`test/user-management/career-timeline.e2e-spec.ts`, audited at submodule
  branch `dn-um-2` HEAD `e9d80ec` — see
  `_bmad-output/test-artifacts/e2e-actual-state-audit-2026-09-01.md`) covers
  `um-ct-01..08` but **404s today** (no `/users/:id/events` route and no
  `UserEvents` model) — reconcile/extend, do not recreate. `um-ct-05`'s
  wrongly-inferred-entry precondition is seeded
  through the manual-add endpoint with an in-file comment (no HTTP-observable
  way to force a genuine bad inference) — preserve that approach.
