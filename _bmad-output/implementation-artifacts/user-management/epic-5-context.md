# Epic 5 Context: Employment Lifecycle

<!-- Regenerated 2026-09-01 from epics.md v1.5 — NEW epic (added by the 2026-08-29 v1.5 correct course); NOT an AD-1 approval. -->
<!-- Compiled planning context for a future story-authoring / dev pass. NOT an AD-1 stage-1 scenario doc. -->

## Goal

Authorized HR actors **record** an employee's departure (effective date +
reason), and the platform **applies** its complete effective-date outcome
exactly once. Departure is a **durable command** separate from `EmploymentStatus`
(AD-20), not a generic technical deactivation. **Leaving is not a career-timeline
event** (§4.9) — employment status is the sole source of truth for a departure.
**FRs covered:** FR-6.

## Stories

- Story 5.1: Record a Departure
- Story 5.2: Apply an Effective Departure

## Requirements & Constraints — GATE FIRST

- **CC-06 blocks implementation.** CC-06 must define the scheduled-departure
  representation, the effective-date executor, retries, and idempotency before
  stage-2 or production work on either story. Scenario prose (AD-1 stage 1) may
  proceed.
- **AD-20 is the binding future target** and must not be redefined at BA/spec
  level: `Departure` is a durable aggregate created by idempotent
  `POST /users/:userId/departures` with `Idempotency-Key` and
  `{effectiveDate, reason}`; observed via `GET .../:departureId`; manually
  accelerated from `retry_wait` via `POST .../:departureId/retry`.
  `effectiveDate` is a PostgreSQL `DATE`; `BUSINESS_TIME_ZONE` is snapshotted as
  `effectiveTimeZone` at creation and resolves an immutable `dueAt` at `00:00`
  in that zone. Auth/AccessControl/workers compare stored `dueAt` with
  PostgreSQL time — never a host/JS-runtime zone.

## Requirements & Constraints — behaviour

- **Story 5.1 (record).** Blocked while the person still **manages or partners
  anybody** through any v1.5 management relation (direct report, department
  manager, PM/DM, PP). The `409` returns leak-safe blocker summaries, an opaque
  `expectedBlockerVersion` digest, and the person's own manager as a default
  re-parent target where available. Re-parenting is the explicit
  user-confirmed `POST /users/:id/departure-reparenting {targetId,
  expectedBlockerVersion}` command (atomic, journaled); timetracker-owned PM/DM
  blockers stay read-only until sync confirms removal. Recording a future
  departure does **not** change the current `active` status early, but once
  scheduled, new direct-report / department-manager / PP responsibility for that
  actor is rejected and new synced PM/DM grants are quarantined with an
  incident.
- **Story 5.2 (apply).** On `dueAt`, one cross-context PostgreSQL transaction:
  close the active employment interval, insert the idempotent `dismissed` fact,
  deactivate account/profile (read-only, out of the default list but still
  filterable), cancel only open action items **assigned to** the departing
  person as *cancelled — departed* (items they authored for other, still-active
  assignees remain open), system-close active mentorship pairs with a system
  note (bypassing the closure-note gate), and end every persisted access
  assignment the actor holds. **All access the departed person held ends
  immediately**, overriding the project 15-minute
  window (`access-control.md` revocation timing / AD-20). Request-time
  auth/AccessControl denies the actor from `00:00` effective regardless of
  worker lag. **No departure event is added to the career timeline.**
- **Idempotency.** The executor retrying after a partial/uncertain failure
  produces no duplicate status, cancellation, closure, or journal effect.
  PostgreSQL-backed workers claim rows with skip-locked selection and a fencing
  token; stale executors no-op.
- **Employment status vs `isActive` vs `leaver`.** `EmploymentStatus`
  (`active`/`dismissed`, time-bounded) receives `dismissed` only when applied.
  `User.isActive` is an internal account/row-retention flag. The `leaver` risk
  level is a *prediction*, never the fact of departure — never conflate.
- NFR-1 pseudonymised data only.

## Technical Decisions

- Router (AD-14, `api-conventions.md`): owned command/history resource
  `POST /users/:id/departures`, `GET /users/:id/departures/:departureId`,
  `POST /users/:id/departures/:departureId/retry` (`202`, `retry_wait` only),
  `POST /users/:id/departure-reparenting`. No `PATCH`/`DELETE`, no cancel or
  reschedule route (spine Deferred — needs a product decision).
- `Departure` aggregate + `EmploymentStatus` interval table — **schema owned by
  CC-06/AD-20**; do not hand-author against a guessed shape. Additive migrations
  land before worker enablement (AD-21 operational release gate).
- States `scheduled | processing | retry_wait | applied`, capped exponential
  retry, sanitized diagnostics, alert threshold, manual retry, no terminal
  abandoned state.
- **Operational release gate (AD-20):** every deployed environment validates the
  same `BUSINESS_TIME_ZONE`, runs ≥1 worker against the same PostgreSQL source,
  and exposes health signals (oldest-due lag, retry-wait count,
  expired/reclaimed leases, request-time cutoff failures, remediation
  incidents). Mixed process config is a startup failure. Hosting/observability
  vendor is Deferred.
- Standard hexagonal layout; domain imports nothing from Prisma/NestJS/HTTP.

## Cross-Story / Cross-Epic Dependencies

- Story 5.2 depends on Story 5.1 (a recorded departure to apply) and on the
  CC-06 executor contract.
- Epic 1 Story 1.5's default-list exclusion reads `EmploymentStatus`.
- Epic 2 Story 2.2's `um-auth-06` asserts a departed account establishes no
  session.
- The re-parenting command's atomic reassignment overlaps Epic 4's relationship
  commands and journal (CC-07) — coordinate the shared transaction contract.
