# UM-REL-11 · A stale `expectedCurrentTargetId` on the PP replace returns 409

**Trace:** epics.md Story 4.2 · PRD FR-10 · api-conventions.md shape 4 ("Stale expected state or a losing concurrent absent-row insert returns `409`; the edge and one before/after journal record commit together", AD-19) · [DEC-UM-010](../../../architecture/user-management-test-decisions.md)

> **BLOCKED — CC-04 + CC-07; scenario prose only.** The optimistic-concurrency
> token semantics and the atomic edge+journal commit are the CC-04/CC-07
> contracts; not translatable to stage-2 or production until they are approved.

## Scenario

**Given** Alice's assigned People Partner has already been changed from Paula to
Nina by a prior request, so the current PP is Nina.

**When** Root submits `PUT /users/<aliceId>/relationships/people-partner` with a
now-stale `{ targetId: <miraId>, expectedCurrentTargetId: <paulaId> }` — the
`expectedCurrentTargetId` still names Paula.

**Then** the response is `409` (stale expected state), the PP assignment remains
Nina, and no journal record is written. The concurrent-safety variant (`@concurrency`,
DEC-UM-010): two parallel replaces from the same baseline yield exactly one `200`
and one `409`, never two edge writes and never two journal records.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice's PP is currently Nina (changed from Paula); Root holds *change organisational relationships*.

## Test

- **Test 1 — stale token**
  - **inputURL:** `PUT /users/<aliceId>/relationships/people-partner`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" }, "body": { "targetId": "<miraId>", "expectedCurrentTargetId": "<paulaId>" } }`
  - **expectedResult:** `409`; PP still resolves to Nina; no journal record.
- **Test 2 — `@concurrency`: two parallel replaces from one baseline**
  - two parallel `PUT` requests, both with `expectedCurrentTargetId: <ninaId>`, different `targetId`.
  - **expectedResult:** one `200`, one `409`; exactly one PP edge; exactly one before/after journal record. **(BLOCKED: journal-count assertion owned by CC-07.)**
