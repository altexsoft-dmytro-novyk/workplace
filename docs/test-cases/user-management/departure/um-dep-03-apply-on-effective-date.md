# UM-DEP-03 · Applying a departure on its effective date

**Trace:** PRD FR-6 · requirements §4.16 · epics.md Story 5.2 (first AC) ·
[database-schema.md](../../../architecture/database-schema.md) §Departure / §EmploymentStatus ·
[access-control.md](../../../architecture/access-control.md) §"Revocation timing" / §"Effective-departure cutoff (AD-20)" ·
api-conventions.md "Departure command and status (AD-20)" ·
ARCHITECTURE-RATIFICATION 2026-09-02 (PM/AD-20 ratified; **CC-06 design approved**; PM/AD-22 / PM/AD-23 close the prior design holes) ·
2026-09-02 PM/AD-5 / PM/AD-23 (`applyDepartureEffects` participant contract) ·
[DEC-UM-004](../../../architecture/user-management-test-decisions.md) (controllable-clock pattern) ·
[DEC-UM-010](../../../architecture/user-management-test-decisions.md) (one worker)

> **SPLIT-GATE — reconciled 2026-09-03 (AD-1 Stage 1).** The earlier
> *"BLOCKED — CC-06"* / *"scenario prose only"* framing is **removed**. The
> 2026-09-02 ratification records **CC-06 as design approved** (P1 open =
> *implementation* absent, not design), so the effective-date **executor /
> worker and every UM-owned local effect are this story's to build** and are
> **first-class stage-2** here.
>
> Only the two **cross-context** legs stay deferred as `it.todo`, because the
> participant contexts do not exist yet (`PM/AD-23` — *"signature approved, no
> participant implements it"*):
> - **action-item cancellation** — the `action-items` context is unbuilt;
> - **mentorship auto-close** — the `mentorship` context (`MentorshipPair`) is
>   unbuilt (AD-17).
>
> Each deferred `it.todo` is titled with its unblock trigger. The `Departure`
> worker, the apply transaction, and the request-time cutoff are
> implementation-absent on disk — this is a stage-1 scenario, not a completion
> claim.

Employment status is a time-bounded business fact (`active` / `dismissed`,
`database-schema.md` §EmploymentStatus), distinct from `User.isActive` (the
internal account/row-retention flag) and from the `leaver` risk prediction.

## Scenario-stage decisions (for the human gate)

1. **Worker mechanism + poll interval.** Recommend a **PostgreSQL polling
   worker**: an injectable `DepartureWorkerService.processDueDepartures()`
   driven by `@nestjs/schedule`'s `@Interval` (**new production dependency** —
   `@nestjs/schedule@^11` + `ScheduleModule.forRoot()` in the backend module;
   flag for the coordinator, it is not currently in `services/backend`
   `package.json`). Proposed interval **60 s in production** (departures are
   date-granular at `00:00`; a minute of materialisation lag is immaterial
   because the request-time cutoff — decision 3 — is independent and immediate),
   configurable per environment. The lighter alternative (a bare `setInterval`
   in `OnApplicationBootstrap`, no new dep) is **not** recommended: `@nestjs/schedule`
   gives graceful-shutdown, `SchedulerRegistry` test control, and clean
   per-env interval config. **No `setTimeout(applyAt dueAt)` in-memory timer**
   for the effective date — the loop re-queries the DB each tick.
2. **Executor test-invocation seam.** Recommend the **injectable service method
   called directly** from the E2E Nest testing module —
   `DepartureWorkerService.processDueDepartures()` — **not** a non-prod
   test-only HTTP endpoint. `testing-strategy.md` (§"Scoped headless-facade
   gate") and `acm8-kc-04` **forbid** a test-only / debug / artificial HTTP
   endpoint. The "controllable clock" (DEC-UM-004) for the *effective date* is
   realised by **back-dating `Departure.dueAt`** (and, for `um-dep-04`,
   `nextAttemptAt`) in the fixture so the row is due against real PostgreSQL
   `now()` — no wall-clock wait, no fake clock. The `@Interval` loop is disabled
   in the E2E env (`DEPARTURE_WORKER_ENABLED=false`) so it never races the
   explicit call.
3. **Request-time cutoff — where + exact comparison.** Recommend extending the
   **session resolver / `SessionGuard`** (the `JwtSessionResolverAdapter` path
   `um-auth-06` coordinates with) so that on **every authenticated request**,
   **before any feature or audience resolution**, it runs one query:
   `SELECT 1 FROM "Departure" WHERE "userId" = $actor AND state IN
   ('scheduled','processing','retry_wait','applied') AND "dueAt" <= now()` —
   `now()` is **PostgreSQL** transaction time, never JS `Date.now()`. A match →
   the request is denied (`401` — no session established, matching `um-auth-06`)
   **regardless of worker state**. Not cached across requests
   (`access-control.md` §6). `AccessControl`'s actor check is the belt-and-braces
   second layer (deny before audience resolution) but the session layer is the
   one LIVE for 5.2.
4. **Health / metrics surface (AD-20).** **LIVE for 5.2:** `GET /health/departures`
   via `@nestjs/terminus` (already a dependency) returning
   `{ oldestDueLagSeconds, retryWaitCount, processingCount, reclaimedLeaseCount,
   requestTimeCutoffDenialsTotal, workerConfig: { enabled, businessTimeZone } }`
   — plain counters computed from `Departure` + in-process tallies.
   **DEFERRED:** alert thresholds, paging, and the observability-vendor push
   (the vendor is Deferred per AD-20); the `remediation incident` counter
   (needs the timetracker-sync seam, same gate as `um-dep-02` T4). The endpoint
   *exposes* the signals; nothing *alerts* on them yet.
5. **`retry` endpoint auth.** Use **`employee:departure:record`** (the "record a
   departure" capability, no-target `isAllowed`) — settled by `api-conventions.md`.
   Do **not** mint a distinct `employee:departure:retry` permission: retry is an
   operational continuation of the same command surface, same actor population,
   and the FR-permission-matrix has no separate cell. (Asserted in `um-dep-04`.)
6. **Mixed-process-config startup check.** **LIVE scope for 5.2:** per-process
   fail-fast in `env.validation.ts` if `BUSINESS_TIME_ZONE` is missing/invalid
   (Story 5.1, reused) **or** if `DEPARTURE_WORKER_ENABLED` is unset (must be an
   explicit `true` / `false`, no implicit default); the effective
   `{ businessTimeZone, workerEnabled }` is logged at boot for operator diff and
   echoed on `GET /health/departures`. **DEFERRED:** cross-process consensus
   (detecting two processes booted with *different* `BUSINESS_TIME_ZONE`) —
   needs a shared registry / the Deferred observability vendor; for 5.2 the
   guarantee is only as strong as "every process reads the same env source",
   recorded in the release gate.

## Scenario

**Given** Alice has a `scheduled` `Departure` whose `dueAt` has been reached
(the E2E fixture back-dates `dueAt` and the test calls
`DepartureWorkerService.processDueDepartures()` directly — DEC-UM-004 pattern,
decision 2); and after Story 5.1's blocker check + re-parenting + post-schedule
guard she holds **no** platform management/PP responsibility and **no** persisted
platform access assignment.

**When** the departure worker claims the due row
(`state='scheduled' AND dueAt <= now()`, `SELECT … FOR UPDATE SKIP LOCKED` in
`effectiveDate, id` order, a fresh `leaseToken` + `leaseUntil`,
`scheduled → processing`) and runs the apply transaction.

**Then**, in **one** `prisma.$transaction`, every effect keyed/constrained by
`Departure.id`:

- the current `active` `EmploymentStatus` row is closed
  (`validTo = effectiveDate`) and a `dismissed` row is inserted
  (`validFrom = effectiveDate`, `sourceDepartureId = departure.id` — the
  `unique` FK makes it idempotent, `departureReason = departure.reason`);
- `User.isActive` becomes `false`;
- the persisted-access sweep runs and ends every platform access assignment
  Alice still holds — after Story 5.1 this is a **no-op**; any residual overlay
  grant is revoked with an idempotent `full_profile_revoke` `AccessJournal` row
  keyed by `departure.id` (project-line access is timetracker-derived and that
  context is absent);
- `applyDepartureEffects({ departureId, departingUserId, effectiveDate,
  leaseToken, tx })` is invoked for the Action-Items and Mentorship
  participants — **a real no-op seam** (`PM/AD-23`; the participants do not
  exist → `it.todo` legs below), no stubbed behaviour;
- the row is marked `applied` (+ `appliedAt`);
- **any failure rolls all local effects back** (one tx) and the row goes to
  `retry_wait` (`um-dep-04`);

and **independently of the worker**, from `00:00` on `effectiveDate` in
`effectiveTimeZone` (`dueAt`), a request Alice could previously make is denied
at request time, immediately — overriding the project-line 15-minute revocation
window (`access-control.md` §"Revocation timing"); and **no** departure /
left-company event is written to her career timeline (FR-11 — employment status
is the sole source; there is no `departure` `UserEvents` type).

**Preconditions:** [fixture](../README.md#canonical-personas); Alice has a
`scheduled` `Departure` with `dueAt` back-dated to the past; `DEPARTURE_WORKER_ENABLED=false`
(the loop is off; the test invokes the worker method); an actor holds
`employee:departure:record` where a request needs an entitled caller; Alice
holds no platform responsibility or access after Story 5.1 re-parenting.

## Test

- **Test 1 — apply on the effective date (LIVE)**
  - **stateChange:** `DepartureWorkerService.processDueDepartures()` is invoked;
    the fixture's back-dated `dueAt` makes Alice's row due.
  - **expectedResult:**
    - `GET /users/<aliceId>/employment` (as an entitled actor) → current status
      `dismissed`; the previous `active` row now has `validTo = effectiveDate`;
      the `dismissed` row has `validFrom = effectiveDate`,
      `sourceDepartureId = <departureId>`, `departureReason = <departure.reason>`.
    - `GET /users/<aliceId>` (as an entitled actor) → the S1 card is
      **read-only** (no writable projection; a `PATCH` → `403`).
    - `GET /users` default page (no `?employmentStatus`) → **does not** contain
      Alice's `id`; `GET /users?employmentStatus=dismissed` → **does** contain
      it (cross-ref `list/um-list-05` / `list/um-list-06`).
    - stage 2 asserts `User.isActive === false`.
    - `GET /users/<aliceId>/departures/<departureId>` → `state: "applied"`,
      `appliedAt` set; no worker internals leaked.
    - `GET /users/<aliceId>/events` → contains **no** departure / left-company
      event (and none exists to add — no such `UserEvents` type).
- **Test 2 — request-time access cutoff, at/after `00:00` effective (LIVE)**
  - **Given** a request Alice previously could make (e.g. a read she held over
    her own S1 card, or any authenticated request under her session).
  - **inputRequest:** that request with `authorization: "Bearer <token:Alice>"`,
    at/after `dueAt`.
  - **expectedResult:** `401` (no usable session — matching `um-auth-06`),
    denied **before** any feature/audience resolution, and immediately — not
    after the project-line 15-minute window. Worker-independence is proven
    separately in **`um-dep-07`**.
- **Test 3 — the persisted-access sweep runs and is a no-op / handles residual (LIVE)**
  - **expectedResult:** with Alice holding no platform access after Story 5.1
    re-parenting, the apply transaction's sweep completes with **zero**
    `AccessJournal` rows written; re-running the worker (idempotent retry) still
    writes zero. Where the fixture seeds one residual overlay grant to Alice,
    the sweep ends it with exactly **one** `full_profile_revoke` `AccessJournal`
    row (`idempotencyKey` derived from `departure.id`), and a retry writes no
    second row.
- **Test 4 — health signal (LIVE, light)**
  - **expectedResult:** before the worker runs,
    `GET /health/departures` → `oldestDueLagSeconds > 0` (Alice's back-dated
    row); after `applied`, `oldestDueLagSeconds === 0` and `retryWaitCount === 0`.
- **`it.todo` — DEFERRED: the Action Items context implements `applyDepartureEffects`**
  - When `action-items` exists: on apply, open Action Items **assigned to**
    Alice → `cancelled — departed` with `cancelledAt` and
    `sourceDepartureId = <departureId>`; Action Items she **authored** for
    other, still-active assignees **remain open** (2026-09-02 PM/AD-5); the
    effect is idempotent on `Departure.id` (`um-dep-04`).
- **`it.todo` — DEFERRED: the Mentorship context implements `applyDepartureEffects`**
  - When `mentorship` (`MentorshipPair`, AD-17) exists: on apply, Alice's
    `status='active'` mentorship pairs (mentor **or** mentee side) →
    `status='ended'`, `endedAt = effectiveDate`,
    `closureNote = <fixed system template>`,
    `endedByDepartureId = <departureId>`, **bypassing** the FR-M9 closure-note
    gate (`mentorship.md` §5.2); a `mentorship_end` career event per
    participant; the `status='active'` predicate is the idempotency key
    (`um-dep-04`).
