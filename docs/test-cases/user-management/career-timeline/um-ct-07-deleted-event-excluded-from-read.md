# UM-CT-07 · A soft-deleted event is absent, not null, from the timeline read — LIVE

**Trace:** PRD Data Model — UserEvents.deletedAt · PRD FR-13 · epics.md Story 3.3 · [../README.md](../README.md) ("Absence is absence") · [career-timeline README](./README.md) (Story 3.3 gate)

> **Status: LIVE.** This is an **actor-agnostic data-correctness property** — a
> soft-deleted row must never surface through `GET /users/:id/events`, whatever
> the reader. It is exercised here with **Root** (the seeded HR Admin, the one
> `profile:timeline:write` holder at this stage) doing both the `DELETE` and the
> read-back — the read is admitted by the **edit-implies-read** rule
> (`canReadTimeline = <S9 read audience> OR isAllowed(viewer, 'profile:timeline:write')`;
> [career-timeline README](./README.md), Dmytro 2026-09-02). The non-HR-Admin
> deleter paths (`um-ct-05`, `um-ct-06`) are deferred `it.todo`; this property
> does not wait on them.

## Scenario

**Given** Alice has a manually-added event on her timeline (seeded via a real
`POST /users/<aliceId>/events` by Root), and Root then soft-deletes it with
`DELETE /users/<aliceId>/events/<eventId>`.

**When** Alice's career timeline is read (`GET /users/<aliceId>/events`).

**Then** the deleted event does not appear in `data` at all — not as a `null`
entry, not as an entry with a `deletedAt` timestamp exposed, simply **absent**.
`listForUser` filters `deletedAt IS NOT NULL` at the repository level (Story 3.1
contract, reaffirmed by Story 3.3).

**Preconditions:** [fixture](../README.md#canonical-personas); the `hr-admin`
role holds the seeded `profile:timeline:write` permission; Alice is a seeded
employee.

## Test

- **Test 1 — seed an event (real `POST`)**
  - **inputURL:** `POST /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" }, "body": { "type": "grade_change", "eventDate": "2020-01-01", "details": { "grade": "M1" } } }`
  - **expectedResult:** `201`; bare `UserEventResponse`, `source: "manual"`. Capture `<eventId>` from the body.
- **Test 2 — baseline: the event is present**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" } }`
  - **expectedResult:** `200` `{ data, canEdit: true }`; `data` includes `<eventId>`.
- **Test 3 — soft-delete it**
  - **inputURL:** `DELETE /users/<aliceId>/events/<eventId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" } }`
  - **expectedResult:** `204`, no body.
- **Test 4 — the event is entirely absent from the read**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" } }`
  - **expectedResult:** `200` `{ data, canEdit: true }`; **no** element of `data` has `id === <eventId>`; no element is `null`; **no** element carries a `deletedAt` key at all. The remaining events (e.g. the seeded `joined_company`) are still present.
