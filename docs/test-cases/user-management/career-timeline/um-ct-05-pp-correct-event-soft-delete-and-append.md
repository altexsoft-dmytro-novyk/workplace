# UM-CT-05 · PP corrects a wrongly-inferred event

**Trace:** PRD Data Model — UserEvents ("An event is an immutable fact — a correction soft-deletes the wrong entry and appends a new one, never an in-place edit") · requirements §4.9 ("to correct events the system inferred wrongly")

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
