# UM-DEP-02 · Recording a departure is blocked while responsibilities remain

**Trace:** PRD FR-6 · requirements §4.16 ("the platform blocks recording the departure while they still manage or partner anybody, and prompts to re-parent first") · epics.md Story 5.1 (second AC) · api-conventions.md "Departure command and status (AD-20)" · access-control.md §"Effective-departure cutoff" (line 343: "Recording is rejected while the person manages or partners anyone") · [database-schema.md](../../../architecture/database-schema.md) §Departure / §Relationship / §Policies · ARCHITECTURE-RATIFICATION 2026-09-02 (CC-06 design approved)

> **Stage-2 first-class (reconciled 2026-09-03).** The authoritative blocker
> set, the opaque `expectedBlockerVersion` digest, and the re-parent command are
> the ratified AD-20 contract (`api-conventions.md` "Departure command and
> status"; `database-schema.md` §Departure). The earlier *"BLOCKED — CC-06"* box
> is removed: the blocker check and its `409` body are first-class stage-2.
> Deferred: Story 5.2's executor and the cross-context apply effects — not
> exercised here.

## Scenario-stage decisions (for the human gate)

- **The blocker check runs BEFORE any `departures` row is written.** A blocked
  request never inserts, never consumes the `Idempotency-Key`, never partially
  commits. Stage 2 asserts zero `Departure` rows for the subject after a `409`.
- **The four blocker kinds** (authoritative v1.5 management / PP responsibility
  the person holds over anyone):
  1. `direct_report` — a `Relationship` `type: 'direct'` where
     `reportsToUserId` = the departing person (they manage a direct report);
  2. `department_manager` — an AR `Policies` row (`targetType: 'department'`,
     `targetRole: 'unit-manager'`) linked to them via `UserPolicies` (they
     manage a department);
  3. `people_partner` — a `Relationship` `type: 'people_partner'` where
     `reportsToUserId` = the departing person (they are someone's assigned PP);
  4. `external_pm_dm` — PM/DM responsibility is timetracker-derived and that
     context does not exist. Represented as a **read-only external-remediation
     item**: "departure stays blocked until timetracker sync confirms removal."
     Never reassigned, never a platform shadow policy.
- **`expectedBlockerVersion` digest derivation.** Proposed:
  `expectedBlockerVersion = "v1:" + base64url(sha256(canonicalJSON))` where
  `canonicalJSON` serializes `{ userId: <departingId>, blockers: [...] }` with
  `blockers` = the **platform-owned** blocker identity tuples sorted by
  `(kind, ref)`:
  - `direct_report` → `{ kind, ref: <relationshipId> }` (one per report),
  - `department_manager` → `{ kind, ref: <userPoliciesId> }` (the attachment
    row; the shared `Policies` row id is stable),
  - `people_partner` → `{ kind, ref: <relationshipId> }`.
  `external_pm_dm` items are **excluded from the digest** — the re-parent
  command cannot mutate them, and they keep the departure blocked regardless of
  digest match. The `userId` prefix stops a digest being replayed across people.
  The digest is recomputed at re-parent time over the still-current platform set
  (`um-dep-05`).
- **Leak-safe `409` body.** Only blockers the caller may administer are
  itemised with target identities; blockers outside the caller's admin scope are
  count-only summaries. Shape:
  ```json
  {
    "error": "departure_blocked_by_responsibilities",
    "blockers": [
      { "kind": "direct_report", "summary": "Manages 1 direct report",
        "targets": [ { "userId": "<...>", "name": "<...>" } ] },
      { "kind": "department_manager", "summary": "Manages department 'JS'",
        "departmentId": "<...>", "departmentName": "JS" },
      { "kind": "people_partner", "summary": "Assigned People Partner for 1 person",
        "targets": [ { "userId": "<...>", "name": "<...>" } ] },
      { "kind": "external_pm_dm", "summary": "Timetracker PM/DM responsibility",
        "remediation": "external",
        "note": "Departure stays blocked until timetracker sync confirms removal." }
    ],
    "expectedBlockerVersion": "v1:<digest>",
    "defaultReparentTargetId": "<the departing person's own current manager, when available>"
  }
  ```

## Scenario

**Given** an actor holds `employee:departure:record`, and the departing person
holds **at least one** authoritative v1.5 responsibility. This suite uses **Bob**
as the departing person — canonically Alice's direct manager
([fixture](../README.md#canonical-personas)) — with the department-manager and PP
edges seeded per test.

**When** the actor submits `POST /users/<bobId>/departures` with an
`Idempotency-Key` header and `{ effectiveDate: <future date>, reason: <text> }`.

**Then** the response is `409` **before any `departures` row is written**; the
body carries leak-safe summaries of the blocking relationships the caller may
administer, an opaque `expectedBlockerVersion` digest, and — when available —
the departing person's own current manager as `defaultReparentTargetId`.

**Preconditions:** [fixture](../README.md#canonical-personas). The outcome
depends on **real** `Relationship` / `Policies` / `UserPolicies` rows, so stage 2
seeds real `User` rows and the subject/target headers are `Bearer <token:<uuid>>`;
the actor uses `Bearer <token:Root>` with `employee:departure:record` granted
in-test.

## Test

- **Test 1 — blocked as a direct manager**
  - **Given** Alice reports to Bob (`Relationship` `type: 'direct'`,
    `reportsToUserId: <bobId>` — canonical); Bob holds nothing else.
  - **inputURL:** `POST /users/<bobId>/departures`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>", "Idempotency-Key": "<key>" }, "body": { "effectiveDate": "2026-12-01", "reason": "relocation" } }`
  - **expectedResult:** `409`; `body.blockers` contains one `direct_report` entry naming Alice; `body.expectedBlockerVersion` is a non-empty `v1:` string; `body.defaultReparentTargetId` = Bob's own manager where the fixture gives him one, else absent.
  - **stateChange:** stage 2 asserts **zero** `Departure` rows for `<bobId>` and that the `Idempotency-Key` is unconsumed (a later valid request with the same key still works once the blocker is cleared — `um-dep-05`).
- **Test 2 — blocked as a department manager**
  - **Given** an AR `Policies` row `{ targetType: 'department', targetId: <deptId>, targetRole: 'unit-manager', type: 'AR' }` + a `UserPolicies` link to `<bobId>`; no direct report, no PP edge for Bob.
  - **inputURL:** `POST /users/<bobId>/departures`
  - **expectedResult:** `409`; `body.blockers` contains one `department_manager` entry with `departmentId` / `departmentName`; digest present.
- **Test 3 — blocked as an assigned People Partner**
  - **Given** a `Relationship` `type: 'people_partner'`, `reportsToUserId: <bobId>` (Bob is Nina's PP — seeded); nothing else.
  - **inputURL:** `POST /users/<bobId>/departures`
  - **expectedResult:** `409`; `body.blockers` contains one `people_partner` entry naming Nina; digest present.
- **Test 4 — external PM/DM blocker is read-only**
  - **Given** the request context carries a timetracker-derived PM/DM signal for `<bobId>` (stage 2: a seeded fake of the sync-derived signal, since the timetracker context is unbuilt — cross-ref the Story 5.2 deferral).
  - **expectedResult:** `409`; `body.blockers` contains an `external_pm_dm` entry with `remediation: "external"` and the "blocked until sync confirms removal" note; it is **absent** from the digest input; no `Policies`/`Relationship` row is created to represent it.
  - Marked `it.todo` until the timetracker sync seam exists to produce the signal (`epic-5-context.md` cross-context deferral); the platform-blocker legs (T1–T3) are live.
- **Test 5 — multiple blocker kinds at once**
  - **Given** Bob holds a direct report (Alice) **and** a department **and** a PP assignment (Nina).
  - **expectedResult:** `409`; `body.blockers` has all three platform kinds; the single digest covers the union of the sorted identities; still zero `Departure` rows.
