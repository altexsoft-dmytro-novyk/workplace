# UM-CT-06 · Unit Manager soft-deletes an event

**Trace:** requirements §4.9 · PRD FR-12, FR-13 · epics.md Story 3.3 · [DEC-UM-001](../../../architecture/user-management-test-decisions.md) (assigned PP + direct Unit Manager only) · access-control.md §2.2 dual gate + §3.3

> Same §2.2 dual gate and pending-S9-`canAccessSection` stage-2 block as `um-ct-03`.

## Scenario

**Given** Bob, Alice's unit manager, and a manually-added event on Alice's timeline (`um-ct-04`) that turns out to be wrong with no replacement needed.

**When** Bob deletes it.

**Then** the event is soft-deleted — `deletedAt` is set, not the row removed.

**Preconditions:** [fixture](../README.md#canonical-personas); the event from `um-ct-04` exists on Alice's timeline.

## Test

- **inputURL:** `DELETE /users/<aliceId>/events/<eventIdFromUmCt04>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Bob>" } }
  ```
- **expectedResult:** `200`.
