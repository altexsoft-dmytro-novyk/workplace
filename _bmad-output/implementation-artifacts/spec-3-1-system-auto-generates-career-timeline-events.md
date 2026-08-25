---
title: 'Story 3.1: System Auto-Generates Career Timeline Events'
type: 'feature'
created: '2026-08-24'
status: 'ready-for-dev'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/epic-3-context.md']
baseline_commit: '6254ed50d910acb4bfa8f046e3cf0b72f3153934'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** No `UserEvents` model or write path exists yet. Two tracked changes already happen in the system with no trace left behind: HR Admin creates a new hire (`POST /users`, Story 1.1) and an entitled actor edits `position` (`PATCH /users/:id`, Story 1.2). Neither leaves a career-timeline record, so PP/Manager-line have no accurate history to read from without hand-logging it themselves.

**Approach:** Add the `UserEvents` Prisma model and migration (per `database-schema.md`'s documented shape) and the domain scaffolding to write it: an entity, a repository port + Prisma-backed implementation, and one `write-user-event.service.ts` operation that stamps `source: "system"`. Wire that operation as an explicit, synchronous call — same transaction, per AD-11 — from Story 1.1's `register-user.service.ts` (writes `joined_company`) and Story 1.2's `edit-user.service.ts` (writes `position_change`, only when the patch actually changes `position`). Add `GET /users/:id/events` so this story's own tests can observe what got written; `POST`/`DELETE` on this resource are Stories 3.2/3.3's job.

## Boundaries & Constraints

**Always:**
- AD-1 gate: get `um-ct-01`, `um-ct-02` approved, then reconcile the existing E2E file's matching blocks into a faithful, human-reviewed translation, then implement to green — never code before that stage-2 checkpoint is real.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- The write is synchronous, in the same transaction as the domain mutation that causes it, via an explicit call from that mutation's own service code — never an event bus, generic table-change listener, or `EventEmitterModule`-style pub/sub (AD-11, `epic-3-context.md` Technical Decisions).
- `position_change` only fires when the patch actually changes `position` to a different value — not on every `PATCH /users/:id` call, and not when `position` is omitted or resubmitted unchanged.
- `eventDate` for `joined_company` equals the new `User`'s `companyJoinDate` exactly, not the wall-clock time of the request.
- Only `joined_company` and `position_change` get hooks in this story — the other six documented `UserEvents.type` values have no triggering context yet (`epic-3-context.md`).

**Ask First:**
- Whether wrapping `register-user.service.ts`'s `User` write and the new `UserEvents` write needs an explicit Prisma `$transaction` block, or whether both can be issued as sequential calls inside a transaction boundary already established elsewhere — the current Story 1.1 code doesn't yet show an explicit transaction wrapper to extend, so this doc doesn't assume one exists.
- Confirm this story owns adding `GET /users/:id/events` at all — it's needed to observe `um-ct-01`/`um-ct-02` (mirrors Story 1.2's own "Ask First" precedent for `GET /users/:id`), but nothing beyond "the list contains X" is specified for it in these two scenario docs (no pagination/ordering contract).

**Never:**
- Don't build a hook for `grade_change`, `department_change`, `employment_type_change`, `extended_leave`, `mentorship_start`, or `mentorship_end` — their triggering contexts don't exist yet.
- Don't add `POST /users/:id/events` (manual add) or `DELETE /users/:id/events/:eventId` (soft-delete) in this story — those are Story 3.2's and Story 3.3's endpoints; this story only needs `GET` to observe its own writes.
- Don't add `updatedAt`/`updatedBy` to `UserEvents` — no named consumer, matching `User`'s own precedent (`epic-1-context.md`, `database-schema.md` Conventions).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Create writes joined_company | Root submits `POST /users` with Nina's S1 fields, incl. `companyJoinDate` | A `UserEvents` row exists for Nina: `type: "joined_company"`, `source: "system"`, `eventDate` = her `companyJoinDate`; visible on `GET /users/<ninaId>/events` with no separate request needed (traces `um-ct-01`) | N/A |
| Edit position writes position_change | Alice has `position: "Engineer"`; Bob submits `PATCH /users/<aliceId>` with `{ position: "Senior Engineer" }` | A `UserEvents` row exists for Alice: `type: "position_change"`, `source: "system"`, `details: { from: "Engineer", to: "Senior Engineer" }`; visible on `GET /users/<aliceId>/events` (traces `um-ct-02`) | N/A |
| Edit without a genuine position change **[inferred — not directly sourced, flagging for confirmation]** | `PATCH /users/<id>` omits `position`, or resubmits its current value | No `position_change` row is written | N/A |

</frozen-after-approval>

## Code Map

- `docs/test-cases/user-management/career-timeline/um-ct-01-system-generates-joined-company-on-create.md`, `um-ct-02-system-generates-position-change-on-edit.md` -- EXIST (status: draft, pending approval) -- get approved as AD-1 stage 1; do not rewrite unless approval feedback requires changes. (`um-ct-03`..`07` belong to Stories 3.2/3.3, not this story.)
- `services/backend/test/user-management/career-timeline.e2e-spec.ts` -- EXISTS on backend branch `user-management` (commit `865df5f`) -- reconcile/extend, do not recreate. This story owns only the `um-ct-01` (creating Nina) and `um-ct-02` (editing Alice's `position`) describe blocks; `um-ct-03`/`04` belong to Story 3.2, `um-ct-05`/`06`/`07` to Story 3.3. Note: the file's shared `aliceId` closure variable is first assigned inside the `um-ct-02` block, and every later block in the file reuses that same Alice — Stories 3.2/3.3 depend on this story's block running (and this story landing) first, matching the file's own sequential `describe` ordering.
- `services/backend/prisma/schema.prisma` -- NEW `UserEvents` model (fields: `id` uuidv7 PK, `userId` FK -> `User`, `type` string, `eventDate` date, `details` jsonb, `source` `'system'|'manual'`, `deletedAt` nullable timestamp, `createdAt`, `createdBy` FK -> `User`) -- per `database-schema.md`; no Prisma model exists for this table yet, and adding it here is a prerequisite for every test in this epic.
- `services/backend/prisma/migrations/` -- new migration, `prisma migrate dev`
- `services/backend/src/user-management/domain/entities/user-event.entity.ts` -- NEW
- `services/backend/src/user-management/domain/interfaces/user-event-repository.port.ts` -- NEW: `{ create(event): Promise<UserEventEntity>; listByUser(userId): Promise<UserEventEntity[]> }` (list excludes soft-deleted rows at the repository level, never filtered ad hoc by a caller)
- `services/backend/src/user-management/domain/services/write-user-event.service.ts` -- NEW: the one call site both hooks below invoke; owns the "system-sourced write" shape (`source: 'system'`)
- `services/backend/src/user-management/infrastructure/user-event.repository.ts` -- NEW: Prisma-backed
- `services/backend/src/user-management/domain/services/register-user.service.ts` -- EXTEND (Story 1.1's file): after creating the `User`, calls `write-user-event.service.ts` with `type: "joined_company"`, `eventDate: user.companyJoinDate`, synchronously, same transaction (AD-11)
- `services/backend/src/user-management/domain/services/edit-user.service.ts` -- EXTEND (Story 1.2's file): when the patch changes `position`, calls `write-user-event.service.ts` with `type: "position_change"`, `details: { from, to }`, synchronously, same transaction (AD-11)
- `services/backend/src/user-management/application/actions/list-user-events.action.ts` -- NEW: session-resolver -> target-scoped `AccessControlPort` check -> repository list, for `GET /users/:id/events`
- `services/backend/src/user-management/application/controllers/user-events.controller.ts` -- NEW: `GET /users/:id/events` only (`POST`/`DELETE` added by Stories 3.2/3.3)
- `services/backend/src/user-management/user-management.module.ts` -- EXTEND: wire the new repository/service/action/controller providers

## Tasks & Acceptance

**Execution:**
- [ ] Get `um-ct-01`, `um-ct-02` approved -- AD-1 stage 1, real human checkpoint
- [ ] Reconcile `test/user-management/career-timeline.e2e-spec.ts`'s `um-ct-01`/`um-ct-02` blocks against the approved scenario docs -- AD-1 stage 2, real human checkpoint
- [ ] `prisma/schema.prisma` + migration -- new `UserEvents` model -- schema before repository code
- [ ] `domain/entities/user-event.entity.ts`, `domain/interfaces/user-event-repository.port.ts`, `domain/services/write-user-event.service.ts` -- pure logic first
- [ ] `infrastructure/user-event.repository.ts` -- Prisma-backed
- [ ] `domain/services/register-user.service.ts` -- wire synchronous `joined_company` write (AD-11: same transaction, explicit call)
- [ ] `domain/services/edit-user.service.ts` -- wire synchronous `position_change` write, only when `position` actually changes (AD-11)
- [ ] `application/actions/list-user-events.action.ts`, `application/controllers/user-events.controller.ts` -- `GET /users/:id/events`
- [ ] `user-management.module.ts` -- wire new providers

**Acceptance Criteria:**
- Given the 2 E2E scenarios (`um-ct-01`/`02`), when `npm run test:e2e` runs, then both pass with no real network calls
- Given a `PATCH /users/:id` that omits or doesn't change `position`, when the request completes, then no `position_change` row is written
- Given the `User` write and the `UserEvents` write in one use case, when either fails, then neither is persisted -- one transaction, no partial state

## Design Notes

`write-user-event.service.ts` is the single call site both hooks invoke — a deliberate narrow seam so the "system writes happen synchronously, same transaction, explicit call" rule (AD-11) has exactly one place it's implemented, not one per hook. NestJS's `EventEmitterModule`/decorator-driven listener pattern is the "natural" way to wire a cross-cutting write like this, and is explicitly barred here: an event-bus write can't be guaranteed to land in the same transaction as the mutation that triggered it, and AD-11 requires that guarantee. This same one-call-site pattern is what Epic 4's Story 4.2 (mentorship-pairing hook) reuses later — Story 3.1 is establishing the pattern, not a one-off.

## Verification

**Commands:**
- `npm run db:migrate` -- new `UserEvents` migration applies cleanly
- `npm run test:e2e` -- `user-management/career-timeline` specs, `um-ct-01`/`02` portion, pass
- `npm run build` -- no TS errors
- `npm run lint` -- clean
