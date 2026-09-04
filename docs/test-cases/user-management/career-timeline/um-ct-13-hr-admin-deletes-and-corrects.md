# UM-CT-13 · HR Admin soft-deletes an event and runs the correction flow — LIVE

**Trace:** requirements §4.9 (manual override — the legacy Excel headcount record) · §3.2 row S9 · §2.3 line 122 ("edit the career timeline") · PRD FR-12, FR-13 · epics.md Story 3.3 (Authorized Actor Edits or Deletes an Event) · [DEC-UM-011](../../../architecture/user-management-test-decisions.md) · [`fr-permission-matrix-draft-2026-09-02.md`](../../../../_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md) §4 / §6 item 4 / §7 (`profile:timeline:write` — "needed soon; default holder still `?`")

> **Status: LIVE — this is the one soft-delete / correction path Story 3.3
> ships.** The gate is `isAllowed(actor, 'profile:timeline:write')` **alone** — a
> feature action, no data-audience half (Dmytro, 2026-09-03; rationale + the
> ⚠️-to-ratify note in the [career-timeline README](./README.md)), exactly
> mirroring Story 3.2's manual-add gate. `profile:timeline:write` is seeded and
> granted to the **`hr-admin` role only** at this stage; the People Partner and
> Unit Manager holder paths come later from the FR-permission-matrix grant
> ([`um-ct-05`](./um-ct-05-pp-correct-event-soft-delete-and-append.md) /
> [`um-ct-06`](./um-ct-06-um-delete-event.md), deferred `it.todo`).
>
> **`DELETE` is soft-delete only:** it sets `deletedAt`, the row persists, and
> `deletedAt` is never exposed to any caller. A "correction" is **two client
> calls** — this `DELETE`, then Story 3.2's `POST /users/:id/events`. There is
> **no** "correct" endpoint and **no** `PATCH` on a single event
> ([`um-ct-08`](./um-ct-08-direct-edit-rejected.md)).

## Scenario

**Given** Root, the seeded bootstrap HR Admin, holds `profile:timeline:write` via
the `hr-admin` functional role, and Alice is a seeded employee.

**When** Root soft-deletes an event on Alice's timeline, and — for a correction —
appends a replacement.

**Then** the `DELETE` returns `204` (no body), the soft-deleted event disappears
entirely from `GET /users/<aliceId>/events` (not `null`, no `deletedAt` key), and
the correction flow leaves only the corrected entry visible.

**And** a caller without `profile:timeline:write` (Bob) is denied `403` with the
event untouched; no token → `401`. A `DELETE` of an unknown, already-soft-deleted,
or cross-timeline `eventId` → `404`.

**Preconditions:** [fixture](../README.md#canonical-personas); the `hr-admin`
role holds a seeded `profile:timeline:write` permission; Alice and Nina are
seeded employees, each with at least her `joined_company` event (`um-ct-01`).

## Test

- **Test 1 — seed, then soft-delete**
  - **inputURL:** `POST /users/<aliceId>/events` then `DELETE /users/<aliceId>/events/<eventId>`
  - **inputRequest (seed):**
    ```json
    { "headers": { "authorization": "Bearer <token:<root-uuid>>" }, "body": { "type": "grade_change", "eventDate": "2019-04-01", "details": { "grade": "M2" } } }
    ```
  - **inputRequest (delete):** `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" } }`
  - **expectedResult:** seed → `201`, capture `<eventId>`; delete → **`204` No Content**, empty body (scenario-stage decision — a soft-delete carries no resource representation; see [career-timeline README](./README.md)). The row persists with `deletedAt` set, verified at stage 2 by a direct repository read, never through the API.
- **Test 2 — the deleted event is absent from the read**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" } }`
  - **expectedResult:** `200` `{ data, canEdit: true }`; no element of `data` has `id === <eventId>`; no element is `null`; no element carries a `deletedAt` key. The seeded `joined_company` is still present.
- **Test 3 — the full correction flow (soft-delete-then-append)**
  - **inputURL:** `POST /users/<aliceId>/events` (seed the wrong entry) → `DELETE /users/<aliceId>/events/<wrongId>` → `POST /users/<aliceId>/events` (the corrected entry) → `GET /users/<aliceId>/events`
  - **inputRequest (wrong entry):**
    ```json
    { "headers": { "authorization": "Bearer <token:<root-uuid>>" }, "body": { "type": "position_change", "eventDate": "2022-02-01", "details": { "position": "Sr. Enginer" } } }
    ```
  - **inputRequest (corrected entry):**
    ```json
    { "headers": { "authorization": "Bearer <token:<root-uuid>>" }, "body": { "type": "position_change", "eventDate": "2022-02-01", "details": { "position": "Senior Engineer" } } }
    ```
  - **expectedResult:** wrong entry → `201` (`<wrongId>`); delete → `204`; corrected entry → `201` (`<rightId>`, distinct from `<wrongId>`), `source: "manual"`; final `GET` → `200`, `data` contains `<rightId>` with `details.position === "Senior Engineer"` and does **not** contain `<wrongId>`.
- **Test 4 — `DELETE` of an unknown or already-soft-deleted `eventId` → `404`**
  - **inputURL:** `DELETE /users/<aliceId>/events/<id>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" } }`
  - **expectedResult:** `404` in both cases (scenario-stage decision):
    - a syntactically-valid but **unknown** `eventId` → `404` (event not found);
    - the `<eventId>` already soft-deleted in Test 1 → `404` — **not** an idempotent `204`. Rationale: a soft-deleted row is absent from every read ("absence is absence"), so from the caller's vantage it does not exist; a second `DELETE` is a delete of a non-existent event. No body is written or changed.
- **Test 5 — no permission / no token**
  - **inputURL:** `DELETE /users/<aliceId>/events/<eventId>` (a live event)
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<bob-uuid>>" } }`, then `{ "headers": {} }`
  - **expectedResult:** Bob (Alice's direct UM, holds **no** `profile:timeline:write`) → `403`, the event untouched (a follow-up read still shows it); missing/invalid token → `401`. The feature-permission gate alone denies Bob — his relationship to Alice is irrelevant at this stage ([`um-ct-10`](./um-ct-10-s9-write-without-permission-denied.md)).
- **Test 6 — `DELETE` of an event on a different user's timeline → `404`**
  - **inputURL:** `DELETE /users/<ninaId>/events/<aliceEventId>` (where `<aliceEventId>.userId === <aliceId> ≠ <ninaId>`)
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" } }`
  - **expectedResult:** `404` (scenario-stage decision) — the event is not on Nina's timeline; the lookup is scoped to `(:id, :eventId)`. Nothing is soft-deleted; a follow-up `GET /users/<aliceId>/events` still shows `<aliceEventId>`. Prevents cross-timeline deletion and does not confirm the id exists elsewhere.

## Notes

- **Gate ordering.** The action checks `isAllowed(actor, 'profile:timeline:write')`
  first → `403` (this also covers a non-existent `:id` target, no `404`
  enumeration surface — same shape as `AddManualUserEventAction`). Only for an
  authorized actor does it then load the event scoped to `(:id, :eventId)` and
  answer `404` when the row is missing, already soft-deleted, or belongs to a
  different user.
- **`canEdit` in the read envelope** is unchanged — `isAllowed(viewer, 'profile:timeline:write')`,
  so `true` for Root, `false` otherwise.
