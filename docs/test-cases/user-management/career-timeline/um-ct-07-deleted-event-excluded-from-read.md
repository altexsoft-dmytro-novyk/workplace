# UM-CT-07 · A soft-deleted event is absent, not null, from the timeline read

**Trace:** PRD Data Model — UserEvents.deletedAt · PRD FR-13 · epics.md Story 3.3 · [../README.md](../README.md) ("Absence is absence")

## Scenario

**Given** the event Bob deleted in `um-ct-06`.

**When** Alice's career timeline is read.

**Then** the deleted event does not appear in the list at all — not as a null entry, not as an entry with a `deletedAt` timestamp exposed, simply absent.

**Preconditions:** [fixture](../README.md#canonical-personas); the event from `um-ct-04` has been soft-deleted per `um-ct-06`.

## Test

- **inputURL:** `GET /users/<aliceId>/events`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Bob>" } }
  ```
- **expectedResult:** `200`; the deleted event's id is absent from the returned list entirely.
