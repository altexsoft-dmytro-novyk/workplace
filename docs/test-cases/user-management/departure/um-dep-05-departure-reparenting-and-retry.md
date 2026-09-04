# UM-DEP-05 · Re-parenting clears the platform blockers, then recording succeeds

**Trace:** PRD FR-6 · requirements §4.16 ("prompts to re-parent first, offering re-parenting to their own manager as a one-click default") · epics.md Story 5.1 (second AC) · api-conventions.md "Departure command and status (AD-20)" — `POST /users/:id/departure-reparenting` · [database-schema.md](../../../architecture/database-schema.md) §Departure / §Relationship / §Policies / §AccessJournal · PM/AD-29 `AccessJournal` (ratified 2026-09-02) · ARCHITECTURE-RATIFICATION 2026-09-02 (CC-06 design approved; CC-07 closed via Story 4.1)

> **Stage-2 first-class (authored 2026-09-03).** `POST /users/:id/departure-reparenting`
> is the ratified explicit user-confirmed remediation (`api-conventions.md`). It
> **never records the departure itself** — it atomically reassigns the
> platform-owned blockers and journals each change, and a follow-up
> `POST .../departures` is what schedules the departure. Deferred: Story 5.2's
> executor — not exercised here.

## Scenario-stage decisions (for the human gate)

- **Transaction boundary — reuse Epic 4's relationship writes.** The re-parent
  command runs one `prisma.$transaction` and calls Epic 4's **application-layer**
  relationship-write operations (the services behind `POST /users/:id/relationships`
  `type: 'direct'`, `PUT /users/:id/relationships/people-partner`, and
  `PUT /departments/:deptId/manager`), passing the shared transaction handle. It
  does **not** re-implement edge SQL or journal writes. Each reassignment emits
  its Epic-4-owned `AccessJournal` row in the same transaction — `kind: 'manager'`
  (direct reports repointed to `targetId`), `kind: 'department_manager'`
  (department manager attachment repointed), `kind: 'people_partner'` (PP
  assignments repointed). **Flag:** Epic 4 Stories 4.1 / 4.2 / 4.3 currently
  describe HTTP-triggered writes; they must expose a `tx`-accepting application
  method for this cross-context reuse (consumption via the target context's
  `application/` exports, per the "actions never inject ports" rule) — a
  coordination item on the shared transaction contract (`epic-5-context.md`).
- **Digest recheck.** The command recomputes `expectedBlockerVersion` over the
  **still-current** platform-owned blocker set (`um-dep-02` derivation) at the
  start of the transaction. Any mismatch → `409`, nothing reassigned.
- **`external_pm_dm` items are never touched** — not reassigned, not journaled;
  they remain blocking until timetracker sync confirms removal.
- **Request body.** `{ targetId, expectedBlockerVersion }`. `targetId` must be
  an active `User`, `!== :id`. Response `200` with a summary of what was
  reassigned: `{ reassigned: { directReports: <n>, departmentManager: <bool>,
  peoplePartnerAssignments: <n> }, remainingExternalBlockers: <n> }`.

## Scenario

**Given** **Bob** holds a direct report (Alice — canonical), a department (`JS`,
seeded), and a PP assignment (Nina, seeded); an actor holds
`employee:departure:record` and `org:relationships:write`; a first
`POST /users/<bobId>/departures` returned `409` with `expectedBlockerVersion`
`V0` and `defaultReparentTargetId` `<colinId>` (Colin — an unrelated seeded
employee used as the re-parent target).

**When** the actor submits `POST /users/<bobId>/departure-reparenting` with
`{ targetId: <colinId>, expectedBlockerVersion: V0 }`.

**Then**, in one transaction: Alice now reports to `<colinId>`; the `JS`
department-manager attachment now points to `<colinId>` (the shared `Policies`
row is kept, the `UserPolicies` link repointed); Nina's PP edge now points to
`<colinId>`; three `AccessJournal` rows commit
(`manager` / `department_manager` / `people_partner`, `before`/`after` snapshots,
`actorUserId` = the actor); and **no `Departure` row exists** — the command did
not record anything.

**And when** the actor then submits `POST /users/<bobId>/departures` with a
future date + reason (Bob now holds no platform blocker).

**Then** the response is `201` and a `Departure` row is written
(`state: 'scheduled'`) — as `um-dep-01`.

**Preconditions:** [fixture](../README.md#canonical-personas). Real
`Relationship` / `Policies` / `UserPolicies` / `AccessJournal` rows — stage 2
seeds real `User` rows; subject/target headers `Bearer <token:<uuid>>`; actor
`Bearer <token:Root>` with both permissions granted in-test.

## Test

- **Test 1 — re-parent atomically reassigns + journals**
  - **inputURL:** `POST /users/<bobId>/departure-reparenting`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" }, "body": { "targetId": "<colinId>", "expectedBlockerVersion": "<V0>" } }`
  - **expectedResult:** `200`; body `{ reassigned: { directReports: 1, departmentManager: true, peoplePartnerAssignments: 1 }, remainingExternalBlockers: 0 }`.
  - **stateChange:** `Relationship` (Alice → Colin, `type: 'direct'`); `UserPolicies` link for the `unit-manager` AR `Policies` row → Colin (same `Policies.id`); `Relationship` (Nina `people_partner` → Colin); exactly three new `AccessJournal` rows (`manager`, `department_manager`, `people_partner`), each with `before`/`after` snapshots and `actorUserId: rootId`; **zero** `Departure` rows for `<bobId>`.
- **Test 2 — stale digest is rejected**
  - **Given** between the `409` and this call, Alice's reports-to was changed by another path, so the current digest is `V1 ≠ V0`.
  - **inputRequest:** body `expectedBlockerVersion: "<V0>"`.
  - **expectedResult:** `409` (`error: "blocker_version_stale"`); no `Relationship` / `UserPolicies` / `AccessJournal` change; the transaction rolled back whole.
- **Test 3 — follow-up record now succeeds**
  - **inputURL:** `POST /users/<bobId>/departures` (after a successful Test 1)
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>", "Idempotency-Key": "<key>" }, "body": { "effectiveDate": "2026-12-01", "reason": "relocation" } }`
  - **expectedResult:** `201`; one `Departure` row `state: 'scheduled'`.
- **Test 4 — the command never records a departure on its own**
  - **expectedResult:** after Test 1 and before Test 3, `GET /users/<bobId>/departures/<any>` has nothing to return and no `Departure` row exists — re-parenting and recording are two explicit steps.
- **Test 5 — `@concurrency`: two identical re-parent calls** → exactly one applies the reassignment (digest matches once); the loser sees `409` `blocker_version_stale` (the set is no longer blocking / the digest moved); the final edge set and journal rows are applied exactly once.
