# UM-CT-05 · PP corrects a wrongly-inferred event

**Trace:** PRD Data Model — UserEvents (immutable-fact correction) · requirements §4.9 · PRD FR-12, FR-13 · epics.md Story 3.3 (Authorized Actor Edits or Deletes an Event) · [DEC-UM-001](../../../architecture/user-management-test-decisions.md) · access-control.md §2.2 dual gate + §3.3

> Same §2.2 dual gate and pending-S9-`canAccessSection` stage-2 block as
> `um-ct-03`. Paula qualifies as the assigned PP.

## Scenario

**Given** Alice has a system-generated `position_change` event with the wrong `details.to` value (a bad inference).

**When** Paula corrects it.

**Then** the correction is never a single in-place update — it is the wrong entry soft-deleted, followed by a new entry appended with the right data, both attributable and both visible in that order in the underlying history.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice has a `position_change` event with `details: { "from": "Engineer", "to": "Sr. Enginer" }` (typo).

## Test

- **Test 1 — baseline: the wrong entry exists**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `200`; list includes the event with the typo'd `details.to`.
- **Test 2 — soft-delete the wrong entry**
  - **inputURL:** `DELETE /users/<aliceId>/events/<wrongEventId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `200`.
- **Test 3 — append the corrected entry**
  - **inputURL:** `POST /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" }, "body": { "type": "position_change", "eventDate": "2026-08-01", "details": { "from": "Engineer", "to": "Senior Engineer" }, "source": "manual" } }`
  - **expectedResult:** `201`; a new event id, distinct from `<wrongEventId>`.
- **Test 4 — observing the corrected timeline**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `200`; the typo'd entry (`<wrongEventId>`) is absent; the corrected entry from Test 3 is present.
