# MEN-END-07 · Ending a pair writes mentorship_end to the career timeline

**Trace:** §4.9 · §4.11 ("an end event is written to the career timeline (4.9)") · PRD FR-M11 · epics.md Story 1.4 · AD-11 (same transaction, explicit call, no event bus) · AD-17

> **PROVISIONAL** route shapes. Stage-2 blocked on G-CTX + G-PERM + **G-CT**.
> **Unapproved draft** — AD-1 approval required; no `approvals.yaml`.

## Scenario

**Given** an active pair (Mona → Alice).

**When** Paula ends the pair with a closure note.

**Then** a `mentorship_end` career-timeline event is appended **in the same
transaction as the pair closure**, through `user-management`'s application
boundary.

**Preconditions:** [fixture](../README.md#canonical-personas); active Mona → Alice pair; Paula is Alice's PP.

## Test

- **Test 1 — baseline: no mentorship_end event for this pair**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `200`; no `mentorship_end` entry for this pair.
- **Test 2 — end the pair**
  - **inputURL:** `POST /mentorship-pairs/<pairId>/closure`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" }, "body": { "note": "Pairing concluded." } }`
  - **expectedResult:** `200`.
  - **stateChange:** in the same transaction, mentorship calls the career-event application boundary to append `mentorship_end` (AD-11) — no mentorship HTTP route for the event write.
- **Test 3 — the event is on the timeline**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `200`; list includes `type: "mentorship_end"`, `source: "system"`, dated at closure.
