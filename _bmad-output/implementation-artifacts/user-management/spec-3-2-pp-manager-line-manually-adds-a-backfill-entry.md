---
title: 'Story 3.2: PP/Manager-Line Manually Adds a Backfill Entry'
type: 'feature'
created: '2026-08-24'
status: 'ready-for-dev'
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-3-context.md']
baseline_commit: '6254ed50d910acb4bfa8f046e3cf0b72f3153934'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 3.1 gives the system a way to auto-write `joined_company`/`position_change` events, but nothing lets PP/Manager-line backfill history that predates the system — the only source for that history today is a separate legacy Excel headcount record, and there's no endpoint to bring any of it into `UserEvents`.

**Approach:** Add `POST /users/:id/events`, gated behind a target-scoped `AccessControlPort` check restricted to the target employee's PP or Manager-line (unit manager, not the full chain) — not registration's blanket no-target check. Add a `CreateUserEventDto` and a domain `add-manual-user-event.service.ts` that stamps `source: "manual"` server-side and persists via Story 3.1's `UserEventRepositoryPort`/Prisma repository, reused as-is.

## Boundaries & Constraints

**Always:**
- AD-1 gate: get `um-ct-03`, `um-ct-04` approved, then reconcile the existing E2E file's matching blocks into a faithful, human-reviewed translation, then implement to green.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.
- Only PP-of-target and Manager-line-of-target may call this endpoint, routed through the target-scoped `AccessControlPort` check — never inline role logic in the controller or action.
- Every manually-added entry is stamped `source: "manual"` server-side — the service, not the caller, decides this value on the normal write path.
- Reuse Story 3.1's `UserEventRepositoryPort` and `UserEvents` Prisma model as-is — this story does not touch `schema.prisma`.
- A new row is always created active (`deletedAt: null`); this endpoint never touches an existing row.

**Ask First:**
- The existing E2E file's `um-ct-05` test (Story 3.3) sends `source: 'manual'` explicitly in a `POST /users/:id/events` body, as part of seeding that story's wrong-entry precondition through this endpoint. Confirm whether `CreateUserEventDto` should accept an optional `source` field at all (accepted but ignored/overridden server-side, vs. rejected outright by `ValidationPipe`'s `whitelist`) — this story's own two scenarios (`um-ct-03`/`04`) never send `source` in the request body, so the DTO's stance on that extra field isn't sourced from this story's own acceptance criteria.
- Exact shape of "Manager-line of target" for this endpoint: `epic-3-context.md` and the PRD both say "UM," i.e. the target's *unit manager* specifically. Confirm this reuses the exact same target-scoped grant Story 1.2 added for `PATCH /users/:id`, or needs a distinct grant scoped to this feature.

**Never:**
- Don't accept `deletedAt` or `id` in the request body.
- Don't let this endpoint modify or soft-delete an existing row — insert-only; correction/soft-delete is Story 3.3's `DELETE` endpoint.
- Don't widen the entitled-actor set beyond the two sourced actors (PP, UM) to "any manager in the line" — §4.9 names PP and UM specifically.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| PP adds backfill entry | Paula (Alice's people partner) submits `POST /users/<aliceId>/events` with a `mentorship_end` entry dated before the system existed | `201`, body reflects `source: "manual"`; entry appears on a subsequent `GET /users/<aliceId>/events` (traces `um-ct-03`) | N/A |
| UM adds backfill entry | Bob (Alice's unit manager) submits `POST /users/<aliceId>/events` with a backfill entry | `201`, body reflects `source: "manual"`; entry appears on a subsequent read — proving both sourced actors, PP and UM, not the full manager line (traces `um-ct-04`) | N/A |

</frozen-after-approval>

## Code Map

- `docs/test-cases/user-management/career-timeline/um-ct-03-pp-manual-add-backfill.md`, `um-ct-04-um-manual-add-backfill.md` -- EXIST (status: draft, pending approval) -- this story's two scenarios; get approved, do not rewrite. (`um-ct-01`/`02` belong to Story 3.1, `um-ct-05`/`06`/`07` to Story 3.3.)
- `services/backend/test/user-management/career-timeline.e2e-spec.ts` -- EXISTS on backend branch `user-management` (commit `865df5f`) -- reconcile/extend, do not recreate. This story owns only the `um-ct-03` (Paula's manual add) and `um-ct-04` (Bob's manual add) describe blocks. `um-ct-04`'s written event id is captured into the file's shared `umCt04EventId` closure variable, which Story 3.3's `um-ct-06`/`07` blocks reuse as the event they delete — this story must land, and this endpoint must exist, before Story 3.3's reconciliation can pass.
- `services/backend/src/user-management/application/dtos/create-user-event.dto.ts` -- NEW: `{ type, eventDate, details }` (+ see Ask First re: an optional `source` field)
- `services/backend/src/user-management/domain/services/add-manual-user-event.service.ts` -- NEW: stamps `source: "manual"`, persists via Story 3.1's `UserEventRepositoryPort`
- `services/backend/src/user-management/application/actions/add-user-event.action.ts` -- NEW: session-resolver -> target-scoped `AccessControlPort` check (PP-or-UM-of-target) -> `add-manual-user-event.service.ts`
- `services/backend/src/user-management/application/controllers/user-events.controller.ts` -- EXTEND (Story 3.1's file): add `POST /users/:id/events` handler
- `services/backend/src/user-management/domain/interfaces/access-control.port.ts` -- EXTEND if a distinct PP/UM-of-target check is needed (see Ask First); otherwise reuse Story 1.2's target-scoped method as-is
- `services/backend/src/user-management/infrastructure/fakes/fake-access-control.adapter.ts` -- EXTEND: register PP-of-target and UM-of-target grants for the test personas (Paula-of-Alice, Bob-of-Alice)
- `services/backend/src/user-management/user-management.module.ts` -- EXTEND: wire the new action/service/DTO providers

## Tasks & Acceptance

**Execution:**
- [ ] Get `um-ct-03`, `um-ct-04` approved -- AD-1 stage 1, real human checkpoint
- [ ] Resolve the "Ask First" items above (DTO's `source` field stance, PP/UM-of-target grant shape) with the human before extending code
- [ ] Reconcile `test/user-management/career-timeline.e2e-spec.ts`'s `um-ct-03`/`um-ct-04` blocks against the approved scenario docs -- AD-1 stage 2, real human checkpoint
- [ ] `application/dtos/create-user-event.dto.ts` -- NEW
- [ ] `domain/services/add-manual-user-event.service.ts` -- NEW
- [ ] `domain/interfaces/access-control.port.ts` + `infrastructure/fakes/fake-access-control.adapter.ts` -- extend for PP/UM-of-target grants
- [ ] `application/actions/add-user-event.action.ts` -- NEW
- [ ] `application/controllers/user-events.controller.ts` -- add `POST /users/:id/events` handler
- [ ] `user-management.module.ts` -- wire new providers

**Acceptance Criteria:**
- Given the 2 E2E scenarios (`um-ct-03`/`04`), when `npm run test:e2e` runs, then both pass with no real network calls
- Given a manually-added entry, when its response body and a subsequent `GET` are compared, then both show `source: "manual"` and identical `type`/`eventDate`/`details`
- Given an actor who is neither PP nor Manager-line for the target, when they submit `POST /users/:id/events`, then the request is denied via the `AccessControlPort` facade (entitlement mechanics themselves proven in access-control's own suite, not retested here)

## Design Notes

This story adds no schema and no new repository method beyond Story 3.1's `create` — the only new domain concept is "who is allowed to call `create` manually, and what value does `source` get." Keeping `add-manual-user-event.service.ts` as a thin wrapper around Story 3.1's repository (rather than a parallel write path) keeps `UserEvents` writes flowing through one persistence seam regardless of whether the caller is a system hook or a human.

## Verification

**Commands:**
- `npm run test:e2e` -- `user-management/career-timeline` specs, `um-ct-03`/`04` portion, pass
- `npm run build` -- no TS errors
- `npm run lint` -- clean
