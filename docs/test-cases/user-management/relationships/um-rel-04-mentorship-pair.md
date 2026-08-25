# UM-REL-04 · HR Admin pairs mentorship and fires mentorship_start

**Trace:** epics.md Story 4.2 · FR-14 · AD-11

## Scenario

**Given** Alice has no active mentorship edge.

**When** Root submits `POST /users/<aliceId>/relationships` with `{ type: 'mentorship', targetId: <paulaId> }`.

**Then** the response is `201`, a `Relationship` row is created (Alice mentee, Paula mentor), and a system `UserEvents` row with `type: "mentorship_start"` is written in the same transaction chain as the mutation.

**Preconditions:** [fixture](../README.md#canonical-personas).

## Test 1 — create mentorship edge

- **inputURL:** `POST /users/<aliceId>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": { "type": "mentorship", "targetId": "<paulaId>" }
  }
  ```
- **expectedResult:** `201`.

## Test 2 — system event

- **inputURL:** `GET /users/<aliceId>/events`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
- **expectedResult:** `200`; list includes `type: "mentorship_start"`, `source: "system"`.

**Distinct from** `um-ct-03`, which proves manual backfill only (DEC-UM-011).
