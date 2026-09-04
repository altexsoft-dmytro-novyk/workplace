# UM-DEP-01 · Record a future departure without changing current status

**Trace:** PRD FR-6 · requirements §4.16 · epics.md Story 5.1 (first AC) · api-conventions.md "Departure command and status (AD-20)" · [database-schema.md](../../../architecture/database-schema.md) §Departure / §EmploymentStatus · ARCHITECTURE-RATIFICATION 2026-09-02 (PM/AD-20 ratified; CC-06 design approved)

> **Stage-2 first-class (reconciled 2026-09-03).** The `Departure` aggregate
> schema is **ratified** (`database-schema.md` §Departure, AD-20) and the
> 2026-09-02 architecture ratification records **CC-06 as design approved**. The
> earlier *"BLOCKED — CC-06; scenario prose only"* box is removed: recording a
> departure (`POST /users/:id/departures` → `201`, the `Departure` row, `dueAt`
> resolution, blocker check, idempotency) is a first-class stage-2 assertion.
> What stays deferred is **Story 5.2's effective-date executor/worker** and the
> cross-context `applyDepartureEffects` effects (Action-Items / Mentorship
> contexts are unbuilt) — none of which this scenario exercises. The
> `Departure` table + writer are still implementation-absent; this is a stage-1
> scenario, not a completion claim.

Employment status is a time-bounded business fact (`active` / `dismissed`,
`database-schema.md` §EmploymentStatus), distinct from `User.isActive`.

## Scenario-stage decisions (for the human gate)

- **`POST /users/:id/departures` `201` body shape.** `{ departureId, userId,
  state: 'scheduled', effectiveDate, effectiveTimeZone, dueAt, reason,
  createdAt }`. Worker internals (`attempts`, `leaseToken`, `lastError`,
  `requestHash`, `idempotencyKey`, `nextAttemptAt`) are **never** in the body.
  `GET .../:departureId` returns the same projection plus sanitized diagnostics
  for non-`scheduled` states (api-conventions.md — "authorized execution status
  and sanitized diagnostics").
- **`dueAt` resolution.** `dueAt` = `00:00` on `effectiveDate` in the
  startup-validated `BUSINESS_TIME_ZONE`, snapshotted to `effectiveTimeZone`,
  resolved **once** at creation. Every later guard compares stored `dueAt` with
  PostgreSQL `now()`, never host/JS local time. Stage 2 asserts `effectiveTimeZone`
  equals the configured zone and `dueAt` is the expected UTC instant for
  `effectiveDate` `00:00` in that zone.
- **`BUSINESS_TIME_ZONE` config.** New required env var (IANA string,
  startup-validated, fail-fast on missing/invalid). Proposed documented example
  value `Europe/London`. Three-places rule (`.env` / `.env.example` /
  `env.validation.ts`) — **flagged for the coordinator to hand the user the
  `.env*` block** (the harness blocks `.env*` edits).

## Scenario

**Given** Alice is an active employee who manages nobody, manages no
department, is nobody's People Partner, and has no timetracker-derived PM/DM
responsibility; and an actor holds the **`employee:departure:record`**
permission (FR-matrix: granted to People Partner — not seeded; stage 2 grants it
in-test to the acting role via the facade, no role-name check).

**When** the actor submits `POST /users/<aliceId>/departures` with an
`Idempotency-Key` header and `{ effectiveDate: <future ISO date>, reason: <text> }`.

**Then** the response is `201`; a `Departure` row is written with
`state: 'scheduled'`, the effective date, the reason, `effectiveTimeZone` = the
configured `BUSINESS_TIME_ZONE`, and a resolved immutable `dueAt`; and **nothing
about Alice's current employment changes** — her current `active`
`EmploymentStatus` row is untouched, she still appears on the default employee
list, and her session still works — until the effective date (Story 5.2 applies
it).

**Preconditions:** [fixture](../README.md#canonical-personas); Alice
manages/partners nobody and holds no PM/DM; actor holds `employee:departure:record`.

## Test

- **Test 1 — record**
  - **inputURL:** `POST /users/<aliceId>/departures`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>", "Idempotency-Key": "<key>" }, "body": { "effectiveDate": "2026-12-01", "reason": "relocation" } }`
  - **expectedResult:** `201`; body = `{ departureId, userId: "<aliceId>", state: "scheduled", effectiveDate: "2026-12-01", effectiveTimeZone: "<BUSINESS_TIME_ZONE>", dueAt: "<00:00 2026-12-01 in that zone, as UTC>", reason: "relocation", createdAt }`.
  - **stateChange:** stage 2 asserts one `Departure` row — `userId: aliceId`, `state: 'scheduled'`, `effectiveDate: 2026-12-01`, `effectiveTimeZone` = configured zone, `dueAt` = the expected instant, `idempotencyKey` = the header value, `attempts: 0`, `appliedAt: null`.
- **Test 2 — GET the departure**
  - **inputURL:** `GET /users/<aliceId>/departures/<departureId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; body `state: "scheduled"`, same `effectiveDate` / `dueAt` / `reason`; no worker internals leaked.
- **Test 3 — current employment unchanged before the date**
  - **expectedResult:**
    - a separate employment-status read (`GET /users/<aliceId>/employment`) still shows `active`;
    - `GET /users` default page still contains Alice (no `?employmentStatus` filter);
    - Alice's existing session still authenticates a request (cross-ref `auth/um-auth-06` — the cutoff is Story 5.2's, on `dueAt`, not on record).
