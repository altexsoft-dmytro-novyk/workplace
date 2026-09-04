---
title: 'Story 5.2: Apply an Effective Departure'
type: 'feature'
status: done
created: 2026-09-01
updated: 2026-09-03
regenerated_from: ../../planning-artifacts/user-management/epics.md
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-5-context.md']
---

> Compiled 2026-09-01 from epics.md v1.5 — **NEW story**. **Reconciled
> 2026-09-03** to the 2026-09-02 architecture ratification, as a **SPLIT-GATE**.
> **NOT an AD-1 approval.**

## Intent

**Problem:** A recorded departure (Story 5.1) must be applied exactly once on
its effective date, ending the employee and every access they hold consistently
— even under worker lag or partial failure (§4.16, AD-20).

**Approach:** A PostgreSQL-backed **application worker** (this story's to build)
claims due `Departure` rows (`SELECT … FOR UPDATE SKIP LOCKED` in
`effectiveDate, id` order, a fresh `leaseToken` + `leaseUntil`,
`scheduled → processing`) and runs **one** `prisma.$transaction` that applies
the full **UM-owned** effective-date outcome and marks the departure `applied`;
failure rolls all local effects back and moves the row to `retry_wait`
(`attempts++`, sanitised `lastError`, capped-backoff `nextAttemptAt`) — there is
**no terminal abandoned state**. The two **cross-context** effects (Action-Items
cancellation, Mentorship auto-close) are invoked through the shared
`applyDepartureEffects({ departureId, departingUserId, effectiveDate,
leaseToken, tx })` seam (`PM/AD-23`) — a **real no-op seam** until those
contexts exist. Request-time auth independently denies the actor from `00:00`
effective (`dueAt` vs PostgreSQL `now()`) regardless of worker state.

## Boundaries & Constraints — GATE (SPLIT)

- **CC-06 is design approved** (ARCHITECTURE-RATIFICATION 2026-09-02 — P1 open =
  *implementation* absent, not design). The earlier *"CC-06 blocks
  implementation"* / *"scenario prose only"* wording is **stale and removed**.
- **LIVE this story (first-class stage-2):** the polling worker + claim /
  lease / fencing / reclaim; the apply `prisma.$transaction` for every UM-owned
  local effect (`EmploymentStatus` close+insert, `User.isActive = false`, the
  persisted-access sweep + `AccessJournal`, `applied` mark); the request-time
  auth cutoff; `POST /users/:id/departures/:departureId/retry`; idempotency of
  every local effect; the stale-executor no-op; the AD-20 health surface (LIVE
  subset — see Cutover Notes); the mixed-process-config startup check (LIVE
  scope — see Cutover Notes).
- **DEFERRED (`it.todo`, `PM/AD-23` — "signature approved, no participant
  implements it"):** the **Action-Items** cancellation leg and the
  **Mentorship** auto-close leg of `applyDepartureEffects`. The call site is
  real (a no-op seam); no stubbed participant behaviour. Unblock triggers: *"the
  Action Items context implements `applyDepartureEffects`"* / *"the Mentorship
  context implements `applyDepartureEffects`"*.
- **AD-20 is the binding target and must not be redefined** at spec level.

## Boundaries & Constraints — behaviour

**Always:**
- AD-1 gate, blank page: scenario docs → red E2E → implementation.
- On `dueAt`, one transaction — **UM-owned local effects (LIVE):**
  - close the current `active` `EmploymentStatus` (`validTo = effectiveDate`)
    and insert a `dismissed` row (`validFrom = effectiveDate`,
    `sourceDepartureId = departure.id` — the `unique` FK is the idempotency
    key, `departureReason = departure.reason`);
  - `User.isActive = false`;
  - run the persisted-access sweep — after Story 5.1's blocker check +
    re-parenting + post-schedule guard the actor holds none, so this is a
    **no-op**; any residual overlay grant is revoked with an idempotent
    `full_profile_revoke` `AccessJournal` row keyed by `departure.id`
    (project-line access is timetracker-derived; that context is absent);
  - call `applyDepartureEffects({ …, tx })` for Action-Items + Mentorship —
    **no-op seam** (DEFERRED `it.todo`);
  - mark the departure `applied` (+ `appliedAt`).
  - **Failure rolls ALL local effects back** (one tx) → `retry_wait`.
- **All access the departed person held ends immediately**, overriding the
  project 15-minute window. The **request-time** cutoff: from `00:00` effective
  in `effectiveTimeZone` (`dueAt`), the session resolver / `SessionGuard` denies
  the actor **before any feature or audience resolution**, comparing stored
  `dueAt` with **PostgreSQL** `now()` — independent of worker state, not cached
  across requests. Coordinates with `auth/um-auth-06`.
- **Idempotent:** a retry (worker resume **or** `POST …/retry`) after
  partial/uncertain failure produces no duplicate `dismissed`, no duplicate
  account-deactivate, no duplicate `AccessJournal` row. Each effect predicated
  on `Departure.id` / a `unique` / a state guard. Stale executors (wrong
  `leaseToken`) no-op and write no retry state.
- **No departure event is added to the career timeline** (FR-11) — there is no
  `departure` `UserEvents` type; employment status is the sole source.
- States `scheduled | processing | retry_wait | applied`; capped exponential
  retry; sanitised diagnostics; **no terminal abandoned state**; manual retry
  via `POST /users/:id/departures/:departureId/retry` (`202`, `retry_wait`
  only; `processing` / `applied` / `scheduled` → `409`), gated
  `@RequireFeature('employee:departure:record')` (no-target `isAllowed`).
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP. The
  executor is a `user-management` **application** orchestrator; it calls other
  contexts' exported **application** services only, under one shared PG unit of
  work — no event bus, no nested transactions.

**Never:**
- No re-parenting invented at apply time — a legacy blocker is surfaced for
  authorized remediation and never delays the security cutoff.
- No in-memory timer for the effective date (no `setTimeout(applyAt dueAt)`) —
  a DB-polling loop only.
- No worker internals in any response body (`attempts`, `leaseToken`,
  `leaseUntil`, `lastError`, `nextAttemptAt`, `requestHash`, `idempotencyKey`).
- No test-only / debug / artificial HTTP endpoint for the worker
  (`testing-strategy.md`).

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Split |
|---|---|---|---|
| Apply on due date — employment | Alice's `scheduled` departure reaches `dueAt`; worker invoked | Current `active` `EmploymentStatus` closed (`validTo = effectiveDate`); `dismissed` row inserted (`validFrom`, `sourceDepartureId`, `departureReason`); `User.isActive = false`; profile read-only, off default list, still under `?employmentStatus=dismissed`; `Departure` → `applied` + `appliedAt`; **no** career event | **LIVE** (`um-dep-03` T1) |
| Apply on due date — access sweep | same | Persisted-access sweep runs inside the tx; no-op after Story 5.1; any residual overlay grant → ended + one idempotent `full_profile_revoke` `AccessJournal` row keyed by `departure.id` | **LIVE** (`um-dep-03` T3) |
| Apply on due date — action items | same | Open Action Items **assigned to** the departing person → `cancelled — departed` (`cancelledAt`, `sourceDepartureId`); items authored for still-active assignees stay open (PM/AD-5) | **DEFERRED `it.todo`** — *the Action Items context implements `applyDepartureEffects`* (`um-dep-03`, `um-dep-04`) |
| Apply on due date — mentorship | same | Active `MentorshipPair`s (mentor or mentee side) → `ended`, `endedAt = effectiveDate`, fixed system `closureNote`, `endedByDepartureId = departureId`, bypassing the FR-M9 gate; `mentorship_end` career event per participant | **DEFERRED `it.todo`** — *the Mentorship context implements `applyDepartureEffects`* (`um-dep-03`, `um-dep-04`) |
| Request-time cutoff, worker lagging | Alice makes a request at/after `00:00` effective; row still `scheduled` | Session resolver denies (`401`) before feature/audience resolution, comparing `dueAt` with PG `now()`; employment still `active`, row still `scheduled` — denial is not materialisation-dependent | **LIVE** (`um-dep-07`) |
| Retry after partial failure | worker resume or `POST …/retry` from `retry_wait` | Remaining local effects complete; no duplicate `dismissed` / deactivate / journal row | **LIVE** (`um-dep-04` T1/T3/T4); "no AI cancelled twice / no pair closed twice" → **DEFERRED `it.todo`** |
| Retry from a non-retryable state | `POST …/retry` when `applied` / `processing` / `scheduled` | `409`; no additional effect | **LIVE** (`um-dep-04` T2) |
| Stale executor | Executor with an expired/reclaimed `leaseToken` attempts apply/reclaim | Writes match 0 rows (fence); no effect, no retry-state mutation; current-token executor owns the row and applies exactly once | **LIVE** (`um-dep-08`) |
| Health surface | operator reads `GET /health/departures` | `{ oldestDueLagSeconds, retryWaitCount, processingCount, reclaimedLeaseCount, requestTimeCutoffDenialsTotal, workerConfig }` | **LIVE subset** (`um-dep-03` T4, `um-dep-07` T4, `um-dep-08` T4); alerting / vendor push → **DEFERRED** |

## v1.5 Cutover Notes

- **Worker mechanism.** Injectable `DepartureWorkerService.processDueDepartures()`
  on a DB-polling loop via **`@nestjs/schedule`** `@Interval` — **a new
  production dependency** (`@nestjs/schedule@^11`, `ScheduleModule.forRoot()`);
  not currently in `services/backend/package.json` — **coordination flag**.
  Proposed poll interval **60 s** in production (configurable per env). E2E runs
  with `DEPARTURE_WORKER_ENABLED=false` and invokes the method directly; the
  "controllable clock" for the effective date is a **back-dated `Departure.dueAt`**
  fixture, not a fake clock.
- **Executor test seam.** The injectable method, called through the Nest
  testing module — **not** a non-prod test-only HTTP endpoint
  (`testing-strategy.md` and `acm8-kc-04` forbid test-only / debug / artificial
  HTTP endpoints).
- **Request-time cutoff.** Extend the session resolver / `SessionGuard`
  (`JwtSessionResolverAdapter` — the `um-auth-06` path). One query per
  authenticated request:
  `SELECT 1 FROM "Departure" WHERE "userId" = $actor AND state IN
  ('scheduled','processing','retry_wait','applied') AND "dueAt" <= now()` —
  PostgreSQL `now()`, never JS. Match → `401`. Not cached.
- **Health surface (AD-20).** LIVE: `GET /health/departures` via
  `@nestjs/terminus` (already a dependency) with the counters above. DEFERRED:
  alert thresholds, paging, observability-vendor push (vendor is Deferred), the
  `remediation incident` counter (needs the timetracker-sync seam — same gate
  as `um-dep-02` T4).
- **Mixed-process-config startup check.** LIVE: per-process fail-fast in
  `env.validation.ts` if `BUSINESS_TIME_ZONE` is missing/invalid (Story 5.1,
  reused) or if `DEPARTURE_WORKER_ENABLED` is unset (must be explicit
  `true`/`false`); effective `{ businessTimeZone, workerEnabled }` logged at
  boot and echoed on the health endpoint. DEFERRED: cross-process consensus
  (detecting two processes with *different* `BUSINESS_TIME_ZONE`) — needs a
  shared registry / the Deferred vendor; the "same config everywhere" guarantee
  is only as strong as "one env source", recorded in the release gate.
- **Operational release gate (AD-20):** schema migration (Story 5.1) before
  worker enablement; every environment validates the same `BUSINESS_TIME_ZONE`,
  runs ≥ 1 worker against the same PostgreSQL source, exposes the health
  signals. `EmploymentStatus` / `Departure` schema is ratified
  (`database-schema.md`) — do not rebuild against a guess.
- **`applyDepartureEffects` seam** — the executor calls it with the shared `tx`;
  the two participants (`action-items`, `mentorship`) are unbuilt, so the call
  is a no-op until each context ships it. `PM/AD-23` signature is frozen:
  `{ departureId, departingUserId, effectiveDate, leaseToken, tx }`.

## Open Questions / Gates

- **`applyDepartureEffects` participants** — the Action-Items and Mentorship
  contexts do not exist; their legs stay `it.todo`. The only hard remaining
  blocker for the full effective-date outcome.
- **`@nestjs/schedule` dependency** — confirm adding it to
  `services/backend/package.json` (or accept a bare `setInterval` +
  `OnApplicationBootstrap` alternative). Coordination flag for the user.
- **Poll interval** — confirm 60 s production default and the per-env override
  key (`DEPARTURE_WORKER_POLL_MS` proposed).
- **Cutoff status code** — `401` (no session) recommended for the departing
  person's own request, matching `um-auth-06`; confirm vs `403` for a
  third-party request made under a stale delegated token.
- **`DEPARTURE_WORKER_ENABLED` + `.env*` block** — new env vars; the harness
  blocks `.env*` edits — flag for the coordinator to hand the user the block
  (alongside Story 5.1's `BUSINESS_TIME_ZONE`).
- Cancellation / rescheduling behaviour is Deferred (no route until Product
  defines the lifecycle).
