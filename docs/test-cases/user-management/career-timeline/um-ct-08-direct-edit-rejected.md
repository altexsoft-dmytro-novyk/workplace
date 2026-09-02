# UM-CT-08 · Direct edit of a career-timeline event is rejected — LIVE

**Trace:** PRD Data Model — UserEvents (immutable-fact correction) · requirements §4.9 · PRD FR-12, FR-13 · epics.md Story 3.3 · [../README.md](../README.md) ("`UserEvents` immutable-fact model — a correction is soft-delete-then-append, never an in-place PATCH") · [career-timeline README](./README.md)

> **Status: LIVE.** Actor-agnostic — there is **no `PATCH` route bound** to a
> single `UserEvents` row, for anyone. Exercised with **Root** (the seeded HR
> Admin, holder of `profile:timeline:write`) so the seed `POST` and the
> follow-up read are both authorized without depending on the deferred
> non-HR-Admin paths. A correction is [`um-ct-13`](./um-ct-13-hr-admin-deletes-and-corrects.md)
> Test 3's soft-delete-then-append flow, never an in-place field mutation.

## Scenario

**Given** an existing `UserEvents` row on Alice's timeline, seeded via a real
`POST /users/<aliceId>/events` by Root.

**When** Root attempts to edit that event directly via `PATCH /users/<aliceId>/events/<eventId>`,
rather than the soft-delete-and-append correction flow.

**Then** the request is rejected because **no route is bound** to `PATCH` on this
resource, and the event's stored fields are unchanged. There is no in-place edit
path for a `UserEvents` row — soft-delete the wrong entry and append a new one
([`um-ct-13`](./um-ct-13-hr-admin-deletes-and-corrects.md) Test 3) is the only
sanctioned correction.

**Preconditions:** [fixture](../README.md#canonical-personas); the `hr-admin`
role holds the seeded `profile:timeline:write` permission; Alice is a seeded
employee.

## Test

- **Test 1 — seed the event (real `POST`)**
  - **inputURL:** `POST /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" }, "body": { "type": "position_change", "eventDate": "2021-06-01", "details": { "position": "Engineer" } } }`
  - **expectedResult:** `201`; bare `UserEventResponse`. Capture `<eventId>` and the returned `details`.
- **Test 2 — the rejected write**
  - **inputURL:** `PATCH /users/<aliceId>/events/<eventId>`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:<root-uuid>>" }, "body": { "details": { "note": "direct edit attempt" } } }
    ```
  - **expectedResult:** `404` or `405` (no route bound to `PATCH` on this resource) — not `200`, and not a silently-accepted edit.
- **Test 3 — observing the event is untouched**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" } }`
  - **expectedResult:** `200` `{ data, canEdit: true }`; `<eventId>` is present with its original `details` from Test 1 — no field reflects Test 2's attempted `details`.
