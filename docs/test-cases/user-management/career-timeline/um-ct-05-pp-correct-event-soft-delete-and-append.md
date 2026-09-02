# UM-CT-05 · PP corrects a wrongly-inferred event — DEFERRED (pending the FR-matrix grant)

**Trace:** PRD Data Model — UserEvents (immutable-fact correction) · requirements §4.9 · §3.2 row S9 · PRD FR-12, FR-13 · epics.md Story 3.3 (Authorized Actor Edits or Deletes an Event) · [DEC-UM-001](../../../architecture/user-management-test-decisions.md) (target scoping for non-HR-Admin holders — assigned PP + direct Unit Manager) · [DEC-UM-011](../../../architecture/user-management-test-decisions.md) · access-control.md §2.2 dual gate + §3.3 · [`fr-permission-matrix-draft-2026-09-02.md`](../../../../_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md) §4 row `profile:timeline:write`, §6 item 4

> **Status: `it.todo` — deferred, not blocked-on-infrastructure.** Story 3.3
> ships the soft-delete path (`DELETE /users/:id/events/:eventId`) gated on
> `isAllowed(actor, 'profile:timeline:write')` **alone** — a feature action, no
> data-audience half — exactly as Story 3.2 ships the manual add (Dmytro,
> 2026-09-03; rationale in the [career-timeline README](./README.md)).
> `profile:timeline:write` is seeded to the **`hr-admin` role only** at this
> stage. A People Partner does **not** hold it, so Paula's `DELETE` and `POST`
> are denied today. The LIVE Story-3.3 correction happy path (Root as the actor)
> is [`um-ct-13`](./um-ct-13-hr-admin-deletes-and-corrects.md).
>
> **Unblock trigger:** the [FR-permission-matrix](../../../../_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md)
> grants `profile:timeline:write` to the **People Partner** role (matrix §6
> item 4, currently `?` pending PO confirmation). At that point this scenario
> activates **and** the DEC-UM-001 audience narrowing must be wired so a PP can
> only correct events for **their own assignees** —
> `canAccessSection('profile:timeline', target) === 'write'` scoped to the
> assigned-PP edge, not every employee. The prose below is the target end-state;
> keep it.

## Scenario (target end-state — `it.todo`)

**Given** Alice has a system-generated `position_change` event with the wrong
`details` value (a bad inference), and Paula is Alice's assigned people partner —
once the FR matrix grants the People Partner role `profile:timeline:write` **and**
DEC-UM-001 scopes that grant to Paula's own assignees.

**When** Paula corrects it.

**Then** the correction is never a single in-place update — it is the wrong entry
**soft-deleted** (`DELETE /users/<aliceId>/events/<wrongEventId>` → `deletedAt`
set, row persists), followed by a new entry **appended** with the right data
(`POST /users/<aliceId>/events`). Both rows persist in the underlying history;
only the corrected one appears in reads.

**And** the same `DELETE` / `POST` for an employee Paula is **not** the assigned
PP of is denied `403` (the DEC-UM-001 scoping — a PP is not a global timeline
editor).

This scenario proves the **correction flow** for a non-HR-Admin holder
(DEC-UM-011). It does not exercise Epic 4's automatic events from relationship
changes — those are covered by `relationships/um-rel-05`.

**Preconditions:** [fixture](../README.md#canonical-personas); People Partner
role holds `profile:timeline:write`; the DEC-UM-001 assigned-PP narrowing is
wired; Paula is Alice's assigned PP; Alice has a `position_change` event with
`details: { "position": "Sr. Enginer" }` (typo) — seeded through the manual-add
endpoint as an equivalent wrong entry (there is no HTTP-observable way to
manufacture a genuinely wrong *inference*; preserve the in-file comment in the
E2E).

## Test (target — do not run until the unblock trigger lands)

- **Test 1 — baseline: the wrong entry exists**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `200`; `data` includes the event with the typo'd `details.position`.
- **Test 2 — soft-delete the wrong entry**
  - **inputURL:** `DELETE /users/<aliceId>/events/<wrongEventId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `204` (soft-delete, no body — see [career-timeline README](./README.md) for the status-code decision).
- **Test 3 — append the corrected entry**
  - **inputURL:** `POST /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" }, "body": { "type": "position_change", "eventDate": "2026-08-01", "details": { "position": "Senior Engineer" } } }`
  - **expectedResult:** `201`; the bare `UserEventResponse`, `source: "manual"`, a new event id distinct from `<wrongEventId>`.
- **Test 4 — observing the corrected timeline**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `200`; `<wrongEventId>` is absent entirely (not `null`, no `deletedAt` exposed); the corrected entry from Test 3 is present.
- **Test 5 — the PP scoping (DEC-UM-001)**
  - **inputURL:** `DELETE /users/<ninaId>/events/<someNinaEventId>` (Nina — Paula is not her assigned PP)
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `403`; no event soft-deleted.
