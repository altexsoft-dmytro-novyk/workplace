# UM-CT-10 · Having S9 write access but lacking the timeline permission → denied — LIVE

**Trace:** requirements §4.9 · §3.2 row S9 · PRD FR-12 · epics.md Story 3.2 (second AC: "Bob has S9 RW through a relationship but lacks the functional permission ... the request is denied") · [DEC-UM-001](../../../architecture/user-management-test-decisions.md) · access-control.md §2.2 dual gate

> **Status: LIVE at the current stage.** The manual-write gate at this stage is
> `isAllowed(actor, 'profile:timeline:write')` **alone** (Dmytro, 2026-09-02;
> [README](./README.md)). That half is a no-target `AccessControlFacade.isAllowed`
> call — available once Epic 0 rebinds the port — so this negative is fully
> assertable now with **no** dependency on the pending `canAccessSection`
> increment. Bob does not hold `profile:timeline:write` (it is seeded to the
> `hr-admin` role only), so he is denied regardless of any relationship.

## Scenario

**Given** Bob is Alice's direct Unit Manager (so under the *target end-state* his
S9 write audience would be satisfied — DEC-UM-001) but he does **not** hold the
`profile:timeline:write` permission.

**When** Bob submits `POST /users/<aliceId>/events` or
`DELETE /users/<aliceId>/events/<eventId>`.

**Then** the request is denied (`403`) and no event is written or soft-deleted.
**The feature-permission gate alone denies him; his relationship to Alice is
irrelevant at this stage** — the interim gate never consults a data audience. Under
the target end-state the same denial holds for the other reason too (the
functional permission is independently required alongside the narrowed audience).

> **v1.5 correction.** The pre-v1.5 suite let Bob (as manager) always add/correct
> events. In v1.5 the functional permission is a separate, independently
> grantable check; a manager who is the direct UM but was never granted
> `profile:timeline:write` is denied.

**Preconditions:** [fixture](../README.md#canonical-personas); Bob is Alice's direct Unit Manager; Bob does not hold `profile:timeline:write`.

## Test

- **inputURL:** `POST /users/<aliceId>/events`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<bob-uuid>>" }, "body": { "type": "grade_change", "eventDate": "2023-01-01", "details": {} } }
  ```
- **expectedResult:** `403`; a follow-up read (Self, `Bearer <token:Alice>`) does not include the attempted entry.
