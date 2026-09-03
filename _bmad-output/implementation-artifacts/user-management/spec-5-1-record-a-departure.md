---
title: 'Story 5.1: Record a Departure'
type: 'feature'
status: done
created: 2026-09-01
updated: 2026-09-03
regenerated_from: ../../planning-artifacts/user-management/epics.md
context: ['{project-root}/_bmad-output/implementation-artifacts/user-management/epic-5-context.md']
---

> Compiled 2026-09-01 from epics.md v1.5 — **NEW story** (Epic 5 added by the
> 2026-08-29 v1.5 correct course). **Reconciled 2026-09-03** to the 2026-09-02
> architecture ratification. **NOT an AD-1 approval.**

## Intent

**Problem:** There is no way to record that an employee is leaving. Generic
deactivation is retired (AD-16). v1.5 requires a durable command carrying an
**effective date** and **reason**, blocked while the person still holds
management/PP responsibility, that does not change the current `active` fact
early (§4.16, AD-20).

**Approach:** `POST /users/:id/departures` with `Idempotency-Key` and
`{effectiveDate, reason}` writes a `Departure` aggregate
(`database-schema.md` §Departure — ratified shape) in `state: 'scheduled'` after
the authoritative blocker check, and returns `201`. Blocker remediation is the
explicit `POST /users/:id/departure-reparenting {targetId, expectedBlockerVersion}`
command, which atomically reassigns the platform-owned blockers and journals
each change but **never records the departure itself**. `GET
/users/:id/departures/:departureId` returns the scheduled state.

## Boundaries & Constraints — GATE

- **The `Departure` aggregate schema is RATIFIED** — `database-schema.md`
  §Departure (AD-20): the full model, `UNIQUE: one non-applied Departure per
  user`, the `dueAt`-at-`00:00`-in-`BUSINESS_TIME_ZONE` rule, the `requestHash`
  canonical contents, the raw-SQL partial-uniqueness + state-machine
  constraints, and the skip-locked worker-claim + fencing-token model. Story 5.1
  **hand-authors the Prisma model + migration to this shape** (raw-SQL partial
  UNIQUE + state-machine + `dueAt` CHECK) — it is not a guess.
- **CC-06 is design approved** (ARCHITECTURE-RATIFICATION 2026-09-02, P1 open =
  *implementation* absent). Story 5.1's stage-2 and production are **no longer
  design-blocked**. The earlier *"BLOCKED — CC-06; scenario prose only"* wording
  in `um-dep-01` / `um-dep-02` / this spec is **stale and removed**.
- **What still stays ahead of Story 5.1:** only **Story 5.2's effective-date
  executor / worker** (`CC-06` / `CC-08` / `CC-09` implementation) and the
  cross-context `applyDepartureEffects` effects (`PM/AD-23` — the Action-Items
  and Mentorship contexts are unbuilt, so nothing implements the participant
  calls). Story 5.1 records; it does not apply.
- **AD-20 is the binding target and must not be redefined** at spec level.

## Boundaries & Constraints — behaviour

**Always:**
- AD-1 gate: `docs/test-cases/user-management/departure/` scenario docs → red
  E2E → implementation. The folder **exists** (`um-dep-01/02/05/06` for this
  story) — this is reconciliation, not a blank page.
- The command requires **`employee:departure:record`** (FR-matrix key; §2.3
  "record a departure"; the draft matrix grants it to **People Partner**). Not
  seeded — stage 2 grants it in-test. Gate is the facade's no-target `isAllowed`
  — **no role-name / `User.position` check**.
- **Blocker check runs BEFORE any `departures` row is written.** The person is
  blocked if they currently hold ANY authoritative v1.5 responsibility over
  anyone:
  - `direct_report` — a `Relationship` `type: 'direct'` where `reportsToUserId`
    = the departing person;
  - `department_manager` — an AR `Policies` row (`targetType: 'department'`,
    `targetRole: 'unit-manager'`) linked via `UserPolicies` to the departing
    person;
  - `people_partner` — a `Relationship` `type: 'people_partner'` where
    `reportsToUserId` = the departing person;
  - `external_pm_dm` — timetracker-derived PM/DM responsibility; that context
    does not exist → represented as a **read-only external-remediation item**
    ("blocked until sync confirms removal"), never a platform shadow policy.
  → `409` **before any row**, body = leak-safe summaries of the blockers the
  caller may administer + an opaque `expectedBlockerVersion` digest + the
  departing person's own current manager as `defaultReparentTargetId` where
  available.
- **`POST /users/:id/departure-reparenting {targetId, expectedBlockerVersion}`**
  — the explicit user-confirmed remediation: one `prisma.$transaction` that
  reassigns the platform-owned blockers (direct reports → `targetId`,
  department-manager attachment → `targetId`, PP assignments → `targetId`) by
  **reusing Epic 4's `application/` relationship-write services** and their
  same-transaction `AccessJournal` writes (`manager` / `department_manager` /
  `people_partner` kinds). A changed digest → `409`. This command **never
  records the departure**. `external_pm_dm` items are never reassigned.
- **Idempotency** (`requestHash` = API contract version, path user id,
  normalized ISO `effectiveDate`, normalized reason, authenticated creator id):
  - same `Idempotency-Key` + same payload → the original `201` result (replay
    rechecks current authz first; a caller who lost access → `403`, no
    disclosure);
  - same key + different payload → `409`;
  - a different key while a non-applied `Departure` already exists for that user
    → `409` (the partial `UNIQUE`).
- `dueAt` = `00:00` on `effectiveDate` in the startup-validated
  `BUSINESS_TIME_ZONE`, snapshotted to `effectiveTimeZone`, resolved **once** at
  creation. Every guard compares stored `dueAt` with PostgreSQL time, never
  host/JS local.
- Recording does **not** change the current `active` `EmploymentStatus`.
  `GET /users/:id/employment` still shows `active`; the person stays on the
  default list; the session still works — until Story 5.2 applies on `dueAt`.
- **Forward guard:** once a departure is scheduled, a new `direct` /
  department-manager / `people_partner` responsibility assignment **for the
  scheduled actor** is rejected (guard lives in **Epic 4's relationship-write
  path**, reading Epic 5 via an exported `hasNonAppliedDeparture(userId)` query);
  new synced PM/DM grants are quarantined with an incident (timetracker sync
  does not exist → a forward-guard note, asserted when Epic 4 write paths + the
  `Departure` table coexist).
- `domain/` imports nothing from Prisma, NestJS transport, or HTTP.

**Never:**
- No generic `DELETE`/deactivate — this is the only lifecycle path.
- No automatic re-parenting; re-parenting is explicit and user-confirmed, and
  never records the departure.
- No `PATCH`/`DELETE`/cancel/reschedule route (spine Deferred — a product
  decision).
- No worker internals (`attempts`, `leaseToken`, `lastError`, `requestHash`,
  `idempotencyKey`, `nextAttemptAt`) in any response body.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Stage-2 |
|---|---|---|---|
| Record success | Alice manages/partners nobody, no PM/DM; authorized actor; `Idempotency-Key` + future `effectiveDate` + reason | `201`; `Departure` row `state: 'scheduled'`, `effectiveTimeZone` = configured zone, `dueAt` resolved once; body `{ departureId, userId, state, effectiveDate, effectiveTimeZone, dueAt, reason, createdAt }`; current `active` status, default-list membership, and session all unchanged | first-class (`um-dep-01`) |
| GET the departure | `GET /users/:id/departures/:departureId` by an authorized reader | `200`; `state: 'scheduled'`, same `effectiveDate` / `dueAt` / `reason`; sanitized diagnostics only for non-`scheduled` states | first-class (`um-dep-01`) |
| Blocked — direct report | Alice is someone's `direct` manager | `409` before any row; `blockers[].kind: 'direct_report'` + `expectedBlockerVersion` + `defaultReparentTargetId` | first-class (`um-dep-02` T1) |
| Blocked — department manager | Alice holds a `unit-manager` AR `Policies` + `UserPolicies` link | `409` before any row; `blockers[].kind: 'department_manager'` with `departmentId` | first-class (`um-dep-02` T2) |
| Blocked — assigned PP | Alice is someone's `people_partner` | `409` before any row; `blockers[].kind: 'people_partner'` | first-class (`um-dep-02` T3) |
| Blocked — external PM/DM | timetracker-derived PM/DM signal | `409`; `blockers[].kind: 'external_pm_dm'`, `remediation: 'external'`; excluded from the digest; no shadow policy row | `it.todo` — needs the sync seam (`um-dep-02` T4) |
| Re-parent then record | `POST /users/:id/departure-reparenting` with a matching digest, then `POST .../departures` | Platform blockers atomically reassigned + 3 `AccessJournal` rows; changed digest → `409`; the command writes **no** `Departure` row; the follow-up record → `201` | first-class (`um-dep-05`) |
| Idempotent replay | Same key + same payload | Original `201` (one `Departure` row); replay after losing authz → `403`, no disclosure | first-class (`um-dep-06` T1/T5) |
| Same key, different payload | `Idempotency-Key` reused, `effectiveDate` changed | `409`; row unchanged | first-class (`um-dep-06` T2) |
| Different key, departure exists | new key, a non-applied `Departure` already exists for the user | `409` (partial `UNIQUE`) | first-class (`um-dep-06` T3) |
| Unauthorized actor | actor lacks `employee:departure:record` | `403`; no `Departure` row; key unconsumed | first-class (`um-dep-06` T4) |
| Apply on `dueAt` | the effective date is reached | status → `dismissed`, effects applied, all access ends | **Story 5.2 — needs the worker** (`um-dep-03`) |

## v1.5 Cutover Notes

- The `Departure` Prisma model + migration are **hand-authored to
  `database-schema.md` §Departure** (ratified) — raw-SQL partial-unique +
  state-machine + `dueAt` CHECK, matching the repo's established raw-SQL
  constraint pattern (Prisma 7 without `partialIndexes`).
- `EmploymentStatus.sourceDepartureId` is an FK to this table — the `Departure`
  migration lands **before or with** any `EmploymentStatus` change that
  references it.
- Additive migration lands before Story 5.2's worker enablement (AD-21
  operational release gate).
- **`BUSINESS_TIME_ZONE`** — new required, startup-validated IANA env var
  (`env.validation.ts` fail-fast). Three-places rule (`.env` / `.env.example` /
  `env.validation.ts`); documented example `Europe/London`. **The harness blocks
  `.env*` — flag for the coordinator to hand the user the block.**

## Open Questions / Gates

- **Story 5.2's executor / worker** (`CC-06` / `CC-08` / `CC-09`
  implementation) + the `applyDepartureEffects` participants (`PM/AD-23`) — the
  only remaining hard blockers, and they are Story 5.2's, not 5.1's.
- **`expectedBlockerVersion` digest derivation** — proposed
  `"v1:" + base64url(sha256({ userId, blockers: sorted platform-owned identity
  tuples }))`, `external_pm_dm` excluded. Confirm the tuple `ref` choice
  (`relationshipId` for edges, `userPoliciesId` for the department attachment).
- **Re-parent transaction reuse** — Epic 4 Stories 4.1 / 4.2 / 4.3 must expose
  their relationship writes as `tx`-accepting `application/` methods for
  cross-context reuse (currently HTTP-handler-shaped). Coordination item on the
  shared transaction contract (`epic-5-context.md`, CC-07).
- **Post-schedule responsibility guard** — lives in Epic 4's relationship-write
  path, reading Epic 5 via an exported query. Confirm the rejection status
  (`409` vs `422`) and that it is asserted only once Epic 4 write paths + the
  `Departure` table both exist.
- **`reason` normalization** — `trim()` + internal-whitespace collapse before
  hashing; recommend **no** case fold (human prose).
- The re-parenting command's atomic reassignment shares a transaction contract
  with Epic 4's relationship commands + journal (CC-07) — coordinate.
