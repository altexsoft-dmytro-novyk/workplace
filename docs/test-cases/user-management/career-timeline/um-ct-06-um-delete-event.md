# UM-CT-06 · Unit Manager soft-deletes an event — DEFERRED (pending the FR-matrix grant)

**Trace:** requirements §4.9 · §3.2 row S9 · PRD FR-12, FR-13 · epics.md Story 3.3 · [DEC-UM-001](../../../architecture/user-management-test-decisions.md) (assigned PP + **direct** Unit Manager only) · access-control.md §2.2 dual gate + §3.3 · [`fr-permission-matrix-draft-2026-09-02.md`](../../../../_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md) §4 row `profile:timeline:write`, §6 item 4

> **Status: `it.todo` — deferred, not blocked-on-infrastructure.** Story 3.3
> ships the soft-delete path gated on `isAllowed(actor, 'profile:timeline:write')`
> **alone** — a feature action, no data-audience half (Dmytro, 2026-09-03;
> [career-timeline README](./README.md)). `profile:timeline:write` is seeded to
> the **`hr-admin` role only** at this stage; Bob (a Unit Manager) does **not**
> hold it, so his `DELETE` is denied today — proved LIVE by
> [`um-ct-10`](./um-ct-10-s9-write-without-permission-denied.md). The LIVE
> Story-3.3 soft-delete happy path (Root as the actor) is
> [`um-ct-13`](./um-ct-13-hr-admin-deletes-and-corrects.md).
>
> **Unblock trigger (two parts):**
> 1. the [FR-permission-matrix](../../../../_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md)
>    grants `profile:timeline:write` to the **Unit Manager** role (matrix §6
>    item 4, currently `?` pending PO confirmation); **and**
> 2. the Access Control **department-tree-walk** increment lands
>    (`targetType: 'department'` + recursion) so DEC-UM-001's "**direct** Unit
>    Manager" (the manager of the employee's own department, §4.17) can be
>    distinguished from a transitive manager.
>
> At that point `canAccessSection('profile:timeline', target) === 'write'` is
> wired, scoped to the direct-UM edge, and this scenario goes live. The prose
> below is the target end-state; keep it.

## Scenario (target end-state — `it.todo`)

**Given** Bob is Alice's **direct** Unit Manager, and a manually-added event on
Alice's timeline (from `um-ct-13` / `um-ct-04`) that turns out to be wrong with
**no replacement needed** — once the FR matrix grants the Unit Manager role
`profile:timeline:write` **and** DEC-UM-001 scopes that grant to Bob's own
department via the AC department-tree walk.

**When** Bob deletes it.

**Then** the event is **soft-deleted** — `deletedAt` is set, the row is **not**
removed — and the response is `204` (no body). A follow-up read no longer
includes it.

**And** the same `DELETE` for an employee outside Bob's department (a transitive
report, or someone in another department) is denied `403` (the DEC-UM-001
"direct only" scoping — a UM is not a global timeline editor).

**Preconditions:** [fixture](../README.md#canonical-personas); Unit Manager role
holds `profile:timeline:write`; the AC department-tree walk is wired; Bob is the
manager of Alice's department; a manually-added, undeleted event exists on
Alice's timeline.

## Test (target — do not run until the unblock trigger lands)

- **Test 1 — soft-delete**
  - **inputURL:** `DELETE /users/<aliceId>/events/<manualEventId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `204`, no body. The row persists with `deletedAt` set (verified at stage 2 by a direct repository read, not through the API — the API never exposes `deletedAt`).
- **Test 2 — the event is gone from reads**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `200`; `<manualEventId>` is absent entirely — not `null`, no `deletedAt` field (see [`um-ct-07`](./um-ct-07-deleted-event-excluded-from-read.md)).
- **Test 3 — the direct-UM scoping (DEC-UM-001)**
  - **inputURL:** `DELETE /users/<outOfDeptUserId>/events/<someEventId>` (an employee not in Bob's department)
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `403`; no event soft-deleted.
