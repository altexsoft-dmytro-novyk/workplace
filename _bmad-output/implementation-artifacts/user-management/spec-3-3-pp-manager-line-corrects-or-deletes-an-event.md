---
title: 'Story 3.3: PP/Manager-Line Corrects or Deletes an Event'
type: 'feature'
created: '2026-08-24'
status: 'ready-for-dev'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-3-context.md']
baseline_commit: '6254ed50d910acb4bfa8f046e3cf0b72f3153934'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Stories 3.1/3.2 can write events but nothing lets PP/Manager-line fix a wrongly-inferred one, or remove a manually-added one that turns out to need no replacement — and the domain rule is explicit that a correction is never an in-place edit.

**Approach:** Add `DELETE /users/:id/events/:eventId` (soft-delete: sets `deletedAt`, never removes the row), gated behind the same PP/UM target-scoped `AccessControlPort` check Story 3.2 introduced. Make Story 3.1's `GET /users/:id/events` query exclude `deletedAt IS NOT NULL` rows at the repository level. A "correction" is just two calls in sequence from the same client — this `DELETE` followed by Story 3.2's `POST` — no separate "correct" endpoint is built.

## Boundaries & Constraints

**Always:**
- AD-1 gate: get `um-ct-05`, `um-ct-06`, `um-ct-07` approved, then reconcile the existing E2E file's matching blocks, then implement to green.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- `DELETE` sets `deletedAt` to the current timestamp — it never removes the row.
- The repository's list query filters out `deletedAt IS NOT NULL` rows once, at the repository boundary — not ad hoc in the controller or action.
- Only PP-of-target and UM-of-target may delete — the same target-scoped check Story 3.2 introduced, reused, not reinvented.
- A soft-deleted-then-read timeline never includes the `deletedAt` field or a null placeholder for the missing row — the row is simply absent from the returned array (FR-13, "absence is absence").
- A correction is always two attributable calls (`DELETE` then `POST`) — never a single in-place update endpoint on this resource.

**Ask First:**
- Whether `DELETE` should return `200`/idempotent-`200` on an already-deleted `eventId`, and what it returns for an `eventId` that never existed or belongs to a different user's timeline — none of `um-ct-05`/`06`/`07` exercises either edge, so this doc doesn't lock a status code for them without confirmation.
- Whether a system-sourced event (`source: "system"`) can be deleted by PP/UM at all, or only manually-added ones. `um-ct-05` deletes what is *conceptually* a system-inferred `position_change` event, though — per `epic-3-context.md`'s Technical Decisions — the existing E2E file actually seeds that precondition through Story 3.2's manual-add endpoint (no HTTP-observable way exists to force a genuine bad system inference), so the E2E file's own `wrongEventId` row is technically `source: "manual"` even though the scenario narrates it as correcting a system inference. `um-ct-06` deletes a manually-added event. Neither case in the existing E2E file exercises deleting a row that is genuinely `source: "system"` end-to-end. Confirm whether `source` should gate deletability at all before treating "source doesn't matter for delete" as a settled rule.

**Never:**
- Don't implement a `PATCH` on a single event — corrections are soft-delete + append; there is no in-place update endpoint on this resource, by design (`epic-3-context.md` Technical Decisions).
- Don't expose `deletedAt` or any trace of a deleted row in `GET /users/:id/events` output.
- Don't hard-delete under any circumstance — `deletedAt` is always set, the row always persists in the table.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| PP corrects a wrongly-inferred event | Alice has a `position_change` event with a wrong `details.to` value; Paula submits `DELETE /users/<aliceId>/events/<wrongEventId>`, then `POST /users/<aliceId>/events` with corrected `type`/`eventDate`/`details` | `DELETE` → `200`; `POST` → `201` with a new event id distinct from `<wrongEventId>`; a subsequent read shows the typo'd entry absent, the corrected entry present (traces `um-ct-05`) | N/A |
| UM deletes a manually-added event needing no replacement | Bob submits `DELETE /users/<aliceId>/events/<eventId>` for a manually-added event (`um-ct-04`'s entry) | `200`; row soft-deleted (`deletedAt` set, row not removed) (traces `um-ct-06`) | N/A |
| Deleted event excluded from read | The event Bob just deleted, in `um-ct-06` | A subsequent `GET /users/<aliceId>/events`: the deleted event's id is absent entirely — not null, not exposing `deletedAt` (traces `um-ct-07`) | N/A |

</frozen-after-approval>

## Code Map

- `docs/test-cases/user-management/career-timeline/um-ct-05-pp-correct-event-soft-delete-and-append.md`, `um-ct-06-um-delete-event.md`, `um-ct-07-deleted-event-excluded-from-read.md` -- EXIST (status: draft, pending approval) -- this story's three scenarios; get approved, do not rewrite. (`um-ct-01`/`02` belong to Story 3.1, `um-ct-03`/`04` to Story 3.2.)
- `services/backend/test/user-management/career-timeline.e2e-spec.ts` -- EXISTS on backend branch `user-management` (commit `865df5f`) -- reconcile/extend, do not recreate. This story owns the `um-ct-05` describe block (four `it`s: seed the wrong entry via Story 3.2's `POST`, baseline read, `DELETE`, `POST` the correction, final read) plus the single-`it` `um-ct-06` and `um-ct-07` blocks, which reuse `um-ct-04`'s event id (the file's `umCt04EventId` closure variable) as the event under test. This story depends on Story 3.1 (schema, shared `aliceId`) and Story 3.2 (the manual-add endpoint that both seeds `um-ct-05`'s wrong entry and produces `um-ct-04`'s event that `um-ct-06`/`07` delete) landing first. In-file comment on this substitution: "`um-ct-05`'s 'wrong, system-inferred' entry has no HTTP-observable way to manufacture — forcing a genuine bad inference isn't a real request any client can make. Its baseline entry is seeded through the same manual-add endpoint `um-ct-03`/`04` already exercise instead; that substitution doesn't change the mechanic under test."
- `services/backend/src/user-management/domain/services/soft-delete-user-event.service.ts` -- NEW
- `services/backend/src/user-management/domain/interfaces/user-event-repository.port.ts` -- EXTEND (Story 3.1's file): add `softDelete(eventId): Promise<void>`; ensure `listByUser` excludes `deletedAt IS NOT NULL` rows
- `services/backend/src/user-management/infrastructure/user-event.repository.ts` -- EXTEND: implement `softDelete`; add the `deletedAt: null` filter to the list query
- `services/backend/src/user-management/application/actions/delete-user-event.action.ts` -- NEW: session-resolver -> target-scoped `AccessControlPort` check (PP-or-UM-of-target, reused from Story 3.2) -> `soft-delete-user-event.service.ts`
- `services/backend/src/user-management/application/controllers/user-events.controller.ts` -- EXTEND (Story 3.1/3.2's file): add `DELETE /users/:id/events/:eventId` handler
- `services/backend/src/user-management/user-management.module.ts` -- EXTEND: wire the new action/service providers

## Tasks & Acceptance

**Execution:**
- [ ] Get `um-ct-05`, `um-ct-06`, `um-ct-07` approved -- AD-1 stage 1, real human checkpoint
- [ ] Resolve the "Ask First" items above (idempotent-delete/not-found status codes, source-based deletability) with the human before extending code
- [ ] Reconcile `test/user-management/career-timeline.e2e-spec.ts`'s `um-ct-05`/`06`/`07` blocks against the approved scenario docs -- AD-1 stage 2, real human checkpoint
- [ ] `domain/interfaces/user-event-repository.port.ts` + `infrastructure/user-event.repository.ts` -- extend with `softDelete`, and exclude soft-deleted rows from `listByUser`
- [ ] `domain/services/soft-delete-user-event.service.ts` -- NEW
- [ ] `application/actions/delete-user-event.action.ts` -- NEW
- [ ] `application/controllers/user-events.controller.ts` -- add `DELETE /users/:id/events/:eventId` handler
- [ ] `user-management.module.ts` -- wire new providers

**Acceptance Criteria:**
- Given the 3 E2E scenarios (`um-ct-05`/`06`/`07`), when `npm run test:e2e` runs, then all pass with no real network calls
- Given a soft-deleted row, when its `userId`'s events are queried directly at the repository/DB level, then the row still exists with `deletedAt` set (not physically removed)
- Given the same soft-deleted row, when `GET /users/:id/events` is called, then the row is absent from the response body — no null entry, no `deletedAt` field leaked
- Given a correction (delete-then-append), when the append's response is inspected, then its `id` is distinct from the deleted event's `id`

## Design Notes

The list query's `deletedAt: null` filter lives in exactly one place — Story 3.1's repository's `listByUser` — so every caller (this story's own reconciled read-checks, Story 3.2's post-add read-checks) gets the same exclusion behavior for free, rather than each action re-filtering independently. This story adds no new `AccessControlPort` grant shape beyond Story 3.2's PP/UM-of-target check; deleting and manually adding are gated by the identical entitlement rule, so they share the identical check call.

## Verification

**Commands:**
- `npm run test:e2e` -- `user-management/career-timeline` specs, `um-ct-05`/`06`/`07` portion, pass
- `npm run build` -- no TS errors
- `npm run lint` -- clean
