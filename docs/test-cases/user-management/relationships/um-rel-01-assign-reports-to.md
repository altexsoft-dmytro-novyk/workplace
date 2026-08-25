# UM-REL-01 · HR Admin assigns reports-to

**Trace:** epics.md Story 4.1 · FR-15 · [DEC-UM-005](../../../architecture/user-management-test-decisions.md) · AD-11

## Scenario

**Given** Alice has no active reports-to edge.

**When** Root submits `POST /users/<aliceId>/relationships` with `{ type: 'direct', targetId: <bobId> }`.

**Then** the response is `201` and a `Relationship` row is created (`type: 'direct'`, Alice reports to Bob).

**Preconditions:** [fixture](../README.md#canonical-personas); Alice has no `direct` edge.

## Test

- **inputURL:** `POST /users/<aliceId>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": { "type": "direct", "targetId": "<bobId>" }
  }
  ```
- **expectedResult:** `201`; body reflects the new relationship id and `type: "direct"`.
- **stateChange:** stage 2 asserts persisted row: `userId: aliceId`, `reportsToUserId: bobId`.
