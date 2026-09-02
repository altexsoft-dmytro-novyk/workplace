---
title: 'Story 5.2: Apply an Effective Departure'
type: 'feature'
status: draft
created: 2026-09-01
regenerated_from: ../../planning-artifacts/user-management/epics.md
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-5-context.md']
---

> Compiled 2026-09-01 from epics.md v1.5 — **NEW story**. **NOT an AD-1
> approval.**

## Intent

**Problem:** A recorded departure (Story 5.1) must be applied exactly once on
its effective date, ending the employee and every access they hold consistently
— even under worker lag or partial failure (§4.16, AD-20).

**Approach:** A PostgreSQL-backed application worker claims due rows
(skip-locked, fencing token, `effectiveDate,id` order) and runs one
cross-context transaction that applies the full effective-date outcome and marks
the departure `applied`. Request-time auth/AccessControl independently deny the
actor from `00:00` effective regardless of worker state.

## Boundaries & Constraints — GATE

- **CC-06 blocks implementation** (executor, retries, idempotency contract).
  Scenario prose may proceed. AD-20 is the binding target.

## Boundaries & Constraints — behaviour

**Always:**
- AD-1 gate, blank page: scenario docs → red E2E → implementation.
- On `dueAt`, one transaction: close the active employment interval, insert the
  idempotent `dismissed` fact, deactivate account/profile (read-only, out of the
  default list but still filterable), cancel only open action items **assigned
  to** the departing person as *cancelled — departed* (items they authored for
  other, still-active assignees remain open), system-close active mentorship
  pairs with a system note (bypassing the closure-note gate), end every
  persisted access assignment the actor holds, mark the departure `applied`.
  Failure rolls all local effects back.
- **All access the departed person held ends immediately**, overriding the
  project 15-minute window. Request-time auth/AccessControl deny the actor from
  `00:00` effective in `effectiveTimeZone` regardless of worker delay.
- **Idempotent:** a retry after partial/uncertain failure produces no duplicate
  status, cancellation, closure, journal, or access effect. Stale executors
  (wrong fencing token) no-op.
- **No departure event is added to the career timeline** (FR-11) — employment
  status is the sole source.
- States `scheduled | processing | retry_wait | applied`; capped exponential
  retry; sanitized diagnostics; alert threshold; manual retry via
  `POST /users/:id/departures/:departureId/retry` (`202`, `retry_wait` only);
  no terminal abandoned state.
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.

**Never:**
- No re-parenting invented at apply time — a legacy blocker is surfaced for
  authorized remediation and never delays the security cutoff.
- No in-memory timers.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior |
|---|---|---|
| Apply on due date | Alice's recorded departure reaches `dueAt` | Employment status → `dismissed`; profile read-only + out of default list (still filterable); open action items → `cancelled — departed`; active mentorship pairs auto-close with a system note; account deactivates; every access Alice held ends immediately (overriding the 15-minute window); no career-timeline event |
| Retry after partial failure | Executor resumes after an uncertain failure | Idempotent — no duplicate status/cancellation/closure/journal/access effect |
| Request-time cutoff | Alice makes a request at/after `00:00` effective, worker delayed | Auth/AccessControl deny before any feature/audience resolution |
| Stale executor | Executor with an expired fencing token attempts to apply/reclaim | No-op; the row's current-token executor owns it |

## v1.5 Cutover Notes

- Worker/executor, `Departure` state machine, and `EmploymentStatus` schema are
  CC-06/AD-20's — do not build against a guess.
- **Operational release gate (AD-20):** schema migration before worker
  enablement; every environment validates the same `BUSINESS_TIME_ZONE`, runs
  ≥1 worker against the same PostgreSQL source, and exposes the AD-20 health
  signals. Mixed process config is a startup failure. Hosting/observability
  vendor is Deferred.

## Open Questions / Gates

- **CC-06** — hard blocker.
- Cancellation/rescheduling behaviour is Deferred (no route until Product
  defines the lifecycle).
