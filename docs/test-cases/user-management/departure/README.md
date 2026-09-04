# User Management — `departure/` (v1.5 Epic 5: Employment Lifecycle)

Stage-1 scenario documents (AD-1) for **Epic 5 — Employment Lifecycle**: an
authorized HR actor records a departure (effective date + reason) and the
platform applies the complete effective-date outcome.

**Status:** unapproved draft. **Story 5.1 (record) reconciled 2026-09-03** to
the 2026-09-02 architecture ratification: the `Departure` aggregate schema is
**ratified** (`database-schema.md` §Departure, AD-20) and **CC-06 is design
approved**. `um-dep-01`, `um-dep-02`, `um-dep-05`, `um-dep-06` lose the
*"BLOCKED — CC-06"* box — recording, the blocker check + `409` body, the
`expectedBlockerVersion` digest, `POST /users/:id/departure-reparenting`, and
`Idempotency-Key` semantics are **first-class stage-2**. `um-deact-*` (generic
`DELETE /users/:id` deactivation) is retired — this is the v1.5 replacement.

**Story 5.2 (apply) reconciled 2026-09-03 as a SPLIT-GATE.** CC-06 being
**design approved**, the effective-date **executor / worker** and every
**UM-owned local effect** are now this story's to build and are **first-class
stage-2**: `um-dep-03` and `um-dep-04` lose the *"BLOCKED — CC-06"* framing, and
two new files land — `um-dep-07` (request-time cutoff proven worker-independent)
and `um-dep-08` (stale-executor fencing no-op). **Only the two cross-context
legs stay deferred** as `it.todo`, because their participant contexts do not
exist (`PM/AD-23` — *"signature approved, no participant implements it"*):
- **action-item cancellation** — unblock: *the Action Items context implements
  `applyDepartureEffects`*;
- **mentorship auto-close** — unblock: *the Mentorship context implements
  `applyDepartureEffects`*.

The `Departure` table, its writer, the re-parent command, the worker, the apply
transaction, and the request-time cutoff are all still implementation-absent —
these are stage-1 scenarios, not completion claims.

## Contents

| File | Proves | Trace | Stage-2 |
| --- | --- | --- | --- |
| `um-dep-01-record-a-departure.md` | `POST /users/:id/departures` → `201`; `Departure` row `state: 'scheduled'`, `dueAt` resolved once in `BUSINESS_TIME_ZONE`; current `EmploymentStatus` still `active`, Alice still on the default list, session still works; `GET .../:departureId` → `200 state: 'scheduled'`. | FR-6 · §4.16 · AD-20 | first-class |
| `um-dep-02-blocked-while-managing-or-partnering.md` | Each of the 3 platform blocker kinds (direct report / department manager / assigned PP) → `409` **before any row**; body = leak-safe blocker summaries + `expectedBlockerVersion` + `defaultReparentTargetId`; the timetracker PM/DM blocker is a read-only external-remediation item. | FR-6 · §4.16 · AD-20 | first-class (T4 `it.todo` — needs the sync seam) |
| `um-dep-05-departure-reparenting-and-retry.md` | `POST /users/:id/departure-reparenting {targetId, expectedBlockerVersion}` atomically reassigns the platform blockers + journals each (`manager` / `department_manager` / `people_partner`); stale digest → `409`; a follow-up `POST .../departures` then succeeds; the command itself never writes a `departures` row. | FR-6 · §4.16 · AD-20 · PM/AD-29 | first-class |
| `um-dep-06-idempotent-record.md` | Same `Idempotency-Key` + same payload → original `201` (one row); same key + different `effectiveDate` → `409`; a different key while a non-applied `Departure` exists → `409`; unauthorized actor → `403`, no row; replay after losing authz → `403`, no disclosure. | FR-6 · §4.16 · AD-20 (`requestHash`) | first-class |
| `um-dep-03-apply-on-effective-date.md` | On the effective date, one tx: status → `dismissed` (`sourceDepartureId`), `User.isActive: false`, profile read-only + off the default list (still filterable — `list/um-list-05/06`), persisted-access sweep (no-op after 5.1 + idempotent `full_profile_revoke` journal for any residual), `Departure` → `applied`; request-time cutoff; no departure career event. **DEFERRED `it.todo`:** action-item cancellation (assigned-to rule, PM/AD-5), mentorship auto-close. | FR-6 · §4.16 · AD-20 · access-control.md §revocation-timing / §effective-departure cutoff | **LIVE (split)** — cross-context legs `it.todo` |
| `um-dep-04-idempotent-retry.md` | Retry (worker resume **or** `POST …/retry`) is idempotent — **LIVE:** no duplicate `dismissed` / account-deactivate / `AccessJournal` row; `retry_wait` only → `202`, `applied`/`processing`/`scheduled` → `409`; `@concurrency` two retries → one applies. **DEFERRED `it.todo`:** "no action item cancelled twice" / "no mentorship pair closed twice". | FR-6 · AD-20 (retry/idempotency/fencing) | **LIVE (split)** — cross-context legs `it.todo` |
| `um-dep-07-request-time-cutoff-independent-of-worker.md` | The departing person makes a request at/after `00:00` effective while the worker has **not** run (row still `scheduled`, `dueAt` past) → `401` before feature/audience resolution. Proves the cutoff is `dueAt`-vs-PG-time, not worker-state-dependent. | FR-6 · §4.16 · access-control.md §effective-departure cutoff · `auth/um-auth-06` | **LIVE** (Story 5.2) |
| `um-dep-08-stale-executor-noop.md` | An executor holding an expired/reclaimed `leaseToken` attempts to apply/reclaim → writes match 0 rows (fence), no effect, no retry-state mutation; the current-token executor owns the row and applies exactly once. `@concurrency` / fencing. | FR-6 · §4.16 · AD-20 · database-schema.md §Departure · domain-driven-design.md | **LIVE** (Story 5.2) |

**File count:** 8 (`um-dep-01`, `um-dep-02`, `um-dep-05`, `um-dep-06` — Story
5.1, first-class stage-2; `um-dep-03`, `um-dep-04`, `um-dep-07`, `um-dep-08` —
Story 5.2, SPLIT-GATE: the worker + UM-owned local effects LIVE, the
Action-Items + Mentorship legs `it.todo`).

## Scenario-stage decisions carried in the files (for the human gate)

### Story 5.1 (`um-dep-01`, `um-dep-02`, `um-dep-05`, `um-dep-06`)

1. **`expectedBlockerVersion` digest** — `"v1:" + base64url(sha256(...))` over
   `{ userId, blockers: sorted platform-owned identity tuples }`;
   `external_pm_dm` items excluded. (`um-dep-02`)
2. **Re-parent transaction boundary** — reuses Epic 4's `application/`
   relationship-write services inside one `prisma.$transaction`; each
   reassignment emits its Epic-4-owned `AccessJournal` row. Requires Epic 4 to
   expose `tx`-accepting application methods — a coordination flag. (`um-dep-05`)
3. **`BUSINESS_TIME_ZONE`** — new required, startup-validated IANA env var,
   three-places rule; documented example `Europe/London`. **Flagged for the
   coordinator to hand the user the `.env*` block.** (`um-dep-01`)
4. **"After scheduled, reject new responsibility for the actor"** — the guard
   lives in Epic 4's relationship-write path (rejects a new `direct` /
   department-manager / PP edge whose target holds a non-applied `Departure`),
   reading Epic 5 via an exported query. Forward guard; asserted when Epic 4
   write paths + the `Departure` table coexist. (`spec-5-1`, `epic-5-context`)
5. **`POST /users/:id/departures` `201` body** — `{ departureId, userId, state,
   effectiveDate, effectiveTimeZone, dueAt, reason, createdAt }`; no worker
   internals. (`um-dep-01`)

### Story 5.2 (`um-dep-03`, `um-dep-04`, `um-dep-07`, `um-dep-08`)

6. **Worker mechanism + poll interval** — an injectable
   `DepartureWorkerService.processDueDepartures()` on a DB-polling loop via
   **`@nestjs/schedule`** `@Interval` (**new production dependency** —
   `@nestjs/schedule@^11` + `ScheduleModule.forRoot()`; not in
   `services/backend/package.json` — coordination flag). Poll interval **60 s**
   in production (`DEPARTURE_WORKER_POLL_MS` per-env). No in-memory
   `setTimeout(applyAt dueAt)` timer. (`um-dep-03`)
7. **Executor test-invocation seam** — the injectable method called directly
   through the Nest testing module; **not** a non-prod test-only HTTP endpoint
   (`testing-strategy.md` / `acm8-kc-04` forbid it). The effective-date
   "controllable clock" is a **back-dated `Departure.dueAt`** fixture.
   (`um-dep-03`)
8. **Request-time cutoff** — extend the session resolver / `SessionGuard`
   (`JwtSessionResolverAdapter`, the `um-auth-06` path): one query per
   authenticated request comparing stored `dueAt` with **PostgreSQL `now()`**
   over `state IN ('scheduled','processing','retry_wait','applied')`; match →
   `401`; not cached. (`um-dep-03`, `um-dep-07`)
9. **Health / metrics surface (AD-20)** — **LIVE:** `GET /health/departures`
   via `@nestjs/terminus` →
   `{ oldestDueLagSeconds, retryWaitCount, processingCount, reclaimedLeaseCount,
   requestTimeCutoffDenialsTotal, workerConfig }`. **DEFERRED:** alert
   thresholds, paging, observability-vendor push, the `remediation incident`
   counter (needs the timetracker-sync seam). (`um-dep-03/07/08`)
10. **`retry` endpoint auth** — `employee:departure:record` (no-target
    `isAllowed`), per `api-conventions.md`; no distinct retry permission.
    (`um-dep-04`)
11. **Mixed-process-config startup check** — **LIVE:** per-process fail-fast if
    `BUSINESS_TIME_ZONE` missing/invalid or `DEPARTURE_WORKER_ENABLED` unset
    (explicit `true`/`false`, no default); effective config logged at boot +
    on the health endpoint. **DEFERRED:** cross-process consensus (two
    processes with different `BUSINESS_TIME_ZONE`) — needs a shared registry /
    the Deferred vendor. (`um-dep-03`)
12. **Local-effect idempotency keys** — `dismissed`:
    `EmploymentStatus.sourceDepartureId` `unique` FK; account-deactivate:
    idempotent `UPDATE`; access-revoke journal: `AccessJournal.idempotencyKey`
    from `departure.id` (+ grant id); `applied` mark: state guard. Stale
    executor: `leaseToken` fence (`WHERE … leaseToken = :myToken`, 0 rows →
    no-op). (`um-dep-04`, `um-dep-08`)

## Endpoints (from api-conventions.md, AD-20)

`POST /users/:id/departures` (`Idempotency-Key`, `{effectiveDate, reason}`) →
`201` after the blocker check; `409` with leak-safe blocker summaries +
`expectedBlockerVersion` when responsibilities remain.
`POST /users/:id/departure-reparenting` (`{targetId, expectedBlockerVersion}`) →
`200`. `GET /users/:id/departures/:departureId` → `200` status + sanitized
diagnostics. `POST /users/:id/departures/:departureId/retry` (accepts only
`retry_wait`, → `202`) — Story 5.2. No `PATCH`/`DELETE`/cancel/reschedule route
exists (spine Deferred — a product decision).
