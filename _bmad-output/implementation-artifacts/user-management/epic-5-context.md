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

- **GATE — updated 2026-09-03 (2026-09-02 architecture ratification).** The
  **`Departure` aggregate schema is ratified** (`database-schema.md` §Departure,
  AD-20) and **CC-06 is design approved** (P1 open = *implementation* absent, not
  design). Consequences:
  - **Story 5.1 (record) proceeds to stage-2 / production.** The `Departure`
    Prisma model + migration are hand-authored to the ratified §Departure shape;
    `POST /users/:id/departures` (`201` + blocker `409` + `expectedBlockerVersion`
    digest), `POST /users/:id/departure-reparenting`, `GET .../:departureId`, and
    the `Idempotency-Key` / `requestHash` semantics are first-class. The stale
    *"CC-06 blocks implementation"* / *"scenario prose only"* language is
    **removed** from `spec-5-1`, `um-dep-01`, `um-dep-02`.
  - **Story 5.2 (apply) — SPLIT-GATE (reconciled 2026-09-03).** CC-06 being
    **design approved**, Story 5.2's **effective-date executor / worker** and
    every **UM-owned local effect** now **proceed to stage-2 / production** as
    this story's build: the DB-polling worker + skip-locked claim + fencing
    token + capped-backoff retry + no-terminal-abandoned-state; the apply
    `prisma.$transaction` (`EmploymentStatus` close+insert with
    `sourceDepartureId`, `User.isActive = false`, the persisted-access sweep +
    idempotent `AccessJournal`, `applied` mark); the request-time auth cutoff
    (`dueAt` vs PostgreSQL `now()`, worker-independent); `POST …/retry`
    (`202` from `retry_wait` only); local-effect idempotency; the
    stale-executor no-op; the LIVE AD-20 health subset
    (`GET /health/departures`); the per-process mixed-config startup check.
    `um-dep-03` / `um-dep-04` lose the *"BLOCKED — CC-06"* framing; new
    `um-dep-07` (worker-independent cutoff) and `um-dep-08` (fencing no-op).
  - **Still deferred (`it.todo` only):** the two **cross-context**
    `applyDepartureEffects` legs (`PM/AD-23` — *"signature approved, no
    participant implements it"*): **action-item cancellation** (unblock: *the
    Action Items context implements `applyDepartureEffects`*; assigned-to rule,
    PM/AD-5) and **mentorship auto-close** (unblock: *the Mentorship context
    implements `applyDepartureEffects`*). The call site is a **real no-op
    seam** — no stubbed participant behaviour.
  - The departure scenario folder **exists** (`docs/test-cases/user-management/departure/`,
    `um-dep-01/02/03/04/05/06/07/08` + README) — Epic 5 stage 1 is
    reconciliation, not a blank page.
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
- **Story 5.2 (apply) — SPLIT-GATE.** On `dueAt`, one PostgreSQL transaction.
  **LIVE (UM-owned local effects, this story's build):** close the active
  employment interval, insert the idempotent `dismissed` fact
  (`sourceDepartureId` `unique` FK), deactivate account/profile (`isActive`
  false, read-only, out of the default list but still filterable via
  `?employmentStatus=dismissed`), run the persisted-access sweep (a no-op after
  Story 5.1 re-parenting; any residual overlay grant → idempotent
  `full_profile_revoke` `AccessJournal` row keyed by `departure.id`), mark
  `applied`. **DEFERRED (`it.todo`, `PM/AD-23` — participants unbuilt):**
  cancel only open action items **assigned to** the departing person as
  *cancelled — departed* (items they authored for other, still-active assignees
  remain open), and system-close active mentorship pairs with the fixed system
  note (bypassing the closure-note gate) — both invoked through the real no-op
  `applyDepartureEffects({ …, tx })` seam. **All access the departed person held
  ends immediately**, overriding the project 15-minute window
  (`access-control.md` revocation timing / AD-20): the **request-time** cutoff
  (session resolver / `SessionGuard`, `dueAt` vs PostgreSQL `now()`) denies the
  actor from `00:00` effective **regardless of worker state** — LIVE, proven
  worker-independent by `um-dep-07`. **No departure event is added to the career
  timeline** (no such `UserEvents` type).
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
- `Departure` aggregate + `EmploymentStatus` interval table — **schema RATIFIED**
  in `database-schema.md` §Departure / §EmploymentStatus (AD-20, 2026-09-02). No
  longer a guessed shape: Story 5.1 hand-authors the Prisma model + migration to
  that spec (raw-SQL partial-unique + state-machine + `dueAt` CHECK).
  `EmploymentStatus.sourceDepartureId` FK → `Departure`. Additive migrations
  land before worker enablement (AD-21 operational release gate).
- States `scheduled | processing | retry_wait | applied`, capped exponential
  retry, sanitized diagnostics, alert threshold, manual retry, no terminal
  abandoned state.
- **Operational release gate (AD-20):** every deployed environment validates the
  same `BUSINESS_TIME_ZONE`, runs ≥1 worker against the same PostgreSQL source,
  and exposes health signals. **LIVE for Story 5.2:** `GET /health/departures`
  (`@nestjs/terminus`, already a dependency) →
  `{ oldestDueLagSeconds, retryWaitCount, processingCount, reclaimedLeaseCount,
  requestTimeCutoffDenialsTotal, workerConfig: { enabled, businessTimeZone } }`;
  and a per-process fail-fast startup check (`BUSINESS_TIME_ZONE` valid +
  `DEPARTURE_WORKER_ENABLED` explicitly set). **Deferred:** alert thresholds,
  paging, the observability-vendor push, cross-process config consensus, and
  the `remediation incident` counter (needs the timetracker-sync seam).
  **Worker mechanism:** injectable `DepartureWorkerService.processDueDepartures()`
  on a DB-polling loop via `@nestjs/schedule` `@Interval` (**a new production
  dependency** — coordination flag), ~60 s in production; no in-memory
  effective-date timer. E2E drives the method directly with a back-dated
  `Departure.dueAt` (no test-only HTTP endpoint — `testing-strategy.md`).
- Standard hexagonal layout; domain imports nothing from Prisma/NestJS/HTTP.

## Cross-Story / Cross-Epic Dependencies

- Story 5.2 depends on Story 5.1 (a recorded departure to apply). CC-06 is
  **design approved** — the executor is Story 5.2's own build, not an external
  blocker. The only remaining external dependency is the `applyDepartureEffects`
  **participants** (`action-items`, `mentorship`), which gate the two
  cross-context `it.todo` legs only.
- Epic 1 Story 1.5's default-list exclusion reads `EmploymentStatus`.
- Epic 2 Story 2.2's `um-auth-06` asserts a departed account establishes no
  session.
- The re-parenting command's atomic reassignment overlaps Epic 4's relationship
  commands and journal (CC-07) — coordinate the shared transaction contract.
