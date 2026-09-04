# UM-CT-04 · Unit Manager manually adds a backfill entry — DEFERRED (pending the FR-matrix grant + AC department increment)

**Trace:** requirements §4.9 · §3.2 row S9 · PRD FR-5, FR-12 · epics.md Story 3.2 · [DEC-UM-001](../../../architecture/user-management-test-decisions.md) (direct Unit Manager = manager of the employee's department, §4.17 — there is no separate "unit" entity) · access-control.md §2.2 dual gate + §3.3 · [`fr-permission-matrix-draft-2026-09-02.md`](../../../../_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md) §4 row `profile:timeline:write`

> **Status: `it.todo` — deferred.** Same reason as `um-ct-03`: Story 3.2 seeds
> `profile:timeline:write` to the **`hr-admin` role only** and the manual-write
> gate at this stage is `isAllowed(actor, 'profile:timeline:write')` **alone**
> (feature action, no audience half — Dmytro 2026-09-02, [README](./README.md)).
> Bob (Unit Manager) does not hold the permission today.
>
> **Unblock trigger — two conditions:**
> 1. the [FR-permission-matrix](../../../../_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md)
>    grants `profile:timeline:write` to the **Unit Manager** role (matrix §6 item 4,
>    currently `?`); **and**
> 2. the DEC-UM-001 **direct** Unit Manager audience scoping is wired — which
>    itself needs the Access Control **department-tree walk** increment
>    (`targetType:'department'` + recursion) so "manager of the employee's
>    department" can be evaluated. The assigned-PP leg (`um-ct-03`) does not need
>    this; the direct-UM leg does.
>
> The prose below is the target end-state; keep it.

## Scenario (target end-state — `it.todo`)

**Given** Bob, Alice's **direct** unit manager (the manager of Alice's department, §4.17 — not a transitive or project-derived manager), once the FR matrix grants the Unit Manager role `profile:timeline:write` and the department-tree walk lets DEC-UM-001 confirm the "direct" relationship.

**When** Bob manually adds an entry for the legacy Excel record.

**Then** the entry is created with `source: "manual"` and appears in Alice's timeline — same mechanic as `um-ct-03`, proving the direct-UM write actor under DEC-UM-001.

**And** a transitive manager two levels up, holding the same permission, is denied `403` for the same `POST` (the DEC-UM-001 "direct only" narrowing).

**Preconditions:** [fixture](../README.md#canonical-personas); Unit Manager role holds `profile:timeline:write`; Bob is the manager of Alice's department; the AC department-tree walk is available.

## Test (target — do not run until the unblock trigger lands)

- **Test 1 — the write**
  - **inputURL:** `POST /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" }, "body": { "type": "joined_company", "eventDate": "2019-06-01", "details": {} } }`
  - **expectedResult:** `201`; bare `UserEventResponse`, `source: "manual"`.
- **Test 2 — observing it in the timeline**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Alice>" } }` (Self read)
  - **expectedResult:** `200`; `data` includes the entry from Test 1.
