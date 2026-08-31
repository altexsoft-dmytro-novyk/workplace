# UM-CT-09 · Holding the timeline permission but lacking S9 write access → denied

**Trace:** requirements §4.9 · PRD FR-12 · epics.md Story 3.2 (third AC: "an actor holds the functional permission but lacks S9 write access ... the request is denied") · [DEC-UM-001](../../../architecture/user-management-test-decisions.md) · access-control.md §2.2 dual gate

> **Stage-2 partially AC-blocked.** The S9-write half is
> `AccessControlFacade.canAccessSection(viewer, 'S9', target)` — **S9 is a
> pending Access Control increment** (ACM-5 ships `'S1'`/`'S10'`/`'S11'` only).
> Until it lands there is no facade call for the section half. Scenario prose
> proceeds; the negative is first-class.

## Scenario

**Given** an actor who **holds** the runtime *edit the career timeline*
permission but is **not** Alice's assigned People Partner and **not** her direct
Unit Manager — e.g. a transitive manager two levels up, or a project-derived
DM/PM (read-only for manual mutation under DEC-UM-001).

**When** the actor submits `POST /users/<aliceId>/events` (a manual backfill) or
`DELETE /users/<aliceId>/events/<eventId>`.

**Then** the request is denied (`403`) and **no** event is written or
soft-deleted. Holding the functional permission does not satisfy the narrowed S9
write audience — both halves of the dual gate must hold.

**Preconditions:** [fixture](../README.md#canonical-personas); actor holds *edit the career timeline*; actor is a transitive/project-derived manager of Alice, not her assigned PP or direct UM.

## Test

- **inputURL:** `POST /users/<aliceId>/events`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<transitive-manager-uuid>>" }, "body": { "type": "grade_change", "eventDate": "2023-01-01", "details": {} } }
  ```
- **expectedResult:** `403`; a follow-up `GET /users/<aliceId>/events` does not include the attempted entry.
