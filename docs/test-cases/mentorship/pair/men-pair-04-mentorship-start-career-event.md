# MEN-PAIR-04 · Pair creation writes mentorship_start to the career timeline

**Trace:** §4.9 ("mentorship pair start and end" are tracked events) · §4.11 · PRD FR-M7 · epics.md Story 1.3 · AD-11 (same transaction, explicit call, no event bus) · AD-17 · UM PRD FR-5/FR-11 (Epic 3 Story 3.1 owns the application boundary)

> **PROVISIONAL** body shape. Stage-2 blocked on G-CTX + G-PERM + **G-CT**
> (`user-management` Epic 3 Story 3.1's career-event application boundary must
> exist). **Unapproved draft** — AD-1 approval required; no `approvals.yaml`.

## Scenario

**Given** no mentorship pair exists between Mona and Alice.

**When** Bob creates the pair.

**Then** a `mentorship_start` career-timeline event is appended for the relevant
profile(s) **in the same transaction as the pair write**, through
`user-management`'s application boundary — mentorship does not write `UserEvents`
directly.

**Preconditions:** [fixture](../README.md#canonical-personas); Bob holds *assign and end mentorships* and access over Alice; Mona's flag is set.

## Test

- **Test 1 — baseline: no mentorship_start event on Alice's timeline**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `200`; no `mentorship_start` entry referencing this pair.
- **Test 2 — create the pair**
  - **inputURL:** `POST /mentorship-pairs`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" }, "body": { "mentorId": "<monaId>", "menteeId": "<aliceId>" } }`
  - **expectedResult:** `201`.
  - **stateChange:** in the same transaction, mentorship calls `user-management`'s career-event application boundary to append a `mentorship_start` event — there is no mentorship HTTP route for the event write (AD-11).
- **Test 3 — the event is on the timeline**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `200`; list includes `type: "mentorship_start"`, `source: "system"`, dated at pair creation.
