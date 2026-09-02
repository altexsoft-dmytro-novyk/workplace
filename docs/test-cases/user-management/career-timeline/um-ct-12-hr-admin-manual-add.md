# UM-CT-12 · HR Admin manually adds a backfill entry — LIVE

**Trace:** requirements §4.9 (manual override — "historical backfill ... the current data lives only in a separate Excel headcount change record") · §3.2 row S9 · §2.3 line 122 ("edit the career timeline") · PRD FR-5, FR-12 · epics.md Story 3.2 (first AC) · [DEC-UM-011](../../../architecture/user-management-test-decisions.md) · [`fr-permission-matrix-draft-2026-09-02.md`](../../../../_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md) §7 (`profile:timeline:write` — "needed soon; default holder still `?`")

> **Status: LIVE — this is the one manual-add path Story 3.2 ships.** The gate is
> `isAllowed(actor, 'profile:timeline:write')` **alone** — a feature action, no
> data-audience half (Dmytro, 2026-09-02; rationale + the ⚠️-to-ratify note in the
> [career-timeline README](./README.md)). `profile:timeline:write` is seeded and
> granted to the **`hr-admin` role only** at this stage; other holders (People
> Partner, Unit Manager) come later from the FR-permission-matrix grant work
> (`um-ct-03` / `um-ct-04`).

## Scenario

**Given** Root, the seeded bootstrap HR Admin, holds `profile:timeline:write` via
the `hr-admin` functional role.

**When** Root submits `POST /users/<aliceId>/events` with a `grade_change` entry
dated before the system existed (sourced from the legacy Excel headcount record),
sending **only** `type`, `eventDate`, and `details` in the body.

**Then** the response is `201` with the bare `UserEventResponse`
(`{ id, type, eventDate, details, source, createdAt }`), `source` is stamped
server-side to `"manual"`, and the row is created active (`deletedAt: null`).

**And** the event is visible on a follow-up `GET /users/<aliceId>/events` read by
**Root directly** — `200 { data, canEdit: true }` — under the **edit-implies-read
rule** (Dmytro, 2026-09-02): `canReadTimeline(viewer, target)` is true when the
S9 read audience matches **OR** `isAllowed(viewer, 'profile:timeline:write')` is
true. Anyone authorized to write the timeline can read it. `canEdit: true`
because Root holds `profile:timeline:write`.

> **Edit implies read (Story 3.2 scope — see [README](./README.md)).** This is
> the timeline-scoped interim of the §2.4 *Full profile access* grant ("HR Admin
> can do and see everything"). Resolver-level `full`-audience support is a
> deferred Access Control item (`_bmad-output/implementation-artifacts/access-control/deferred-work.md`);
> Story 3.2 only wires the `profile:timeline` read route to also admit a
> `profile:timeline:write` holder.

**Preconditions:** [fixture](../README.md#canonical-personas); the `hr-admin` role holds a seeded `profile:timeline:write` permission; Alice is a seeded employee with at least her `joined_company` event (`um-ct-01`).

## Test

- **Test 1 — the write**
  - **inputURL:** `POST /users/<aliceId>/events`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:<root-uuid>>" }, "body": { "type": "grade_change", "eventDate": "2018-09-01", "details": { "grade": "M2" } } }
    ```
  - **expectedResult:** `201`; body is `{ id, type: "grade_change", eventDate: "2018-09-01", details: { "grade": "M2" }, source: "manual", createdAt: <ts> }`. No `{ data, canEdit }` envelope — the bare resource, matching how `PATCH /users/:id` returns the bare user.
- **Test 2 — Root reads it back (edit implies read)**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" } }`
  - **expectedResult:** `200` `{ data, canEdit: true }`; `data` includes the Test 1 event with `source: "manual"`. Root has no S9 read audience but holds `profile:timeline:write`, so `canReadTimeline` admits him and `canEdit` is `true`.
- **Test 2b — Self also sees it**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Alice>" } }`
  - **expectedResult:** `200` `{ data, canEdit }` envelope; `data` includes the Test 1 event with `source: "manual"`; `canEdit === false` (Alice does not hold `profile:timeline:write`).
- **Test 3 — server-owned fields in the body are ignored (whitelist strips, no 400)**
  - **inputURL:** `POST /users/<aliceId>/events`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:<root-uuid>>" }, "body": { "type": "position_change", "eventDate": "2019-01-01", "details": {}, "id": "00000000-0000-0000-0000-000000000000", "deletedAt": "2020-01-01T00:00:00Z", "source": "system", "createdBy": "<someone-else>" } }
    ```
  - **expectedResult:** `201`; the created row has a server-generated `id` (not the supplied one), `deletedAt: null`, `source: "manual"` (not `"system"`), `createdBy` = Root's id. The unknown/forbidden keys are stripped silently by `whitelist`, consistent with the rest of UM's DTOs; no `400`.
- **Test 4 — missing/invalid `type` → 400**
  - **inputURL:** `POST /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" }, "body": { "eventDate": "2018-09-01", "details": {} } }`
  - **expectedResult:** `400`; nothing written.
- **Test 5 — missing/invalid `eventDate` → 400**
  - **inputURL:** `POST /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" }, "body": { "type": "grade_change", "eventDate": "not-a-date", "details": {} } }`
  - **expectedResult:** `400`; nothing written.
- **Test 6 — no permission → 403**
  - **inputURL:** `POST /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Ida>" }, "body": { "type": "grade_change", "eventDate": "2018-09-01", "details": {} } }`
  - **expectedResult:** `403` (Ida holds only an unrelated functional permission — DEC-UM-002); nothing written. `401` for a missing/invalid token.
