# UM-CT-10 · Having S9 write access but lacking the timeline permission → denied

**Trace:** requirements §4.9 · PRD FR-12 · epics.md Story 3.2 (second AC: "Bob has S9 RW through a relationship but lacks the functional permission ... the request is denied") · [DEC-UM-001](../../../architecture/user-management-test-decisions.md) · access-control.md §2.2 dual gate

> **Stage-2 partially AC-blocked** — same pending-S9-`canAccessSection` increment
> as `um-ct-09`. This half of the gate (the runtime *edit the career timeline*
> permission) is a no-target `AccessControlFacade.isAllowed` call and is
> available once Epic 0 rebinds the port.

## Scenario

**Given** Bob is Alice's direct Unit Manager (so his S9 write audience is
satisfied — DEC-UM-001) but he does **not** hold the runtime *edit the career
timeline* permission.

**When** Bob submits `POST /users/<aliceId>/events` or
`DELETE /users/<aliceId>/events/<eventId>`.

**Then** the request is denied (`403`) and no event is written or soft-deleted.
The section audience alone does not satisfy the dual gate — the functional
permission is also required.

> **v1.5 correction.** The pre-v1.5 suite let Bob (as manager) always add/correct
> events. In v1.5 the functional permission is a separate, independently
> grantable check; a manager who is the direct UM but was never granted *edit the
> career timeline* is denied.

**Preconditions:** [fixture](../README.md#canonical-personas); Bob is Alice's direct Unit Manager; Bob does not hold *edit the career timeline*.

## Test

- **inputURL:** `POST /users/<aliceId>/events`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<bob-uuid>>" }, "body": { "type": "grade_change", "eventDate": "2023-01-01", "details": {} } }
  ```
- **expectedResult:** `403`; a follow-up read does not include the attempted entry.
