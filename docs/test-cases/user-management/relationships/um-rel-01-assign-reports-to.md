# UM-REL-01 · HR Admin assigns reports-to

**Trace:** epics.md Story 4.1 (Change an Employee's Manager) · PRD FR-10 · [DEC-UM-005](../../../architecture/user-management-test-decisions.md) · AD-11 · access-control.md §3.4 journal (AD-19 / CC-07 gate)

## Scenario

**Given** Alice has no active reports-to edge, and Root holds the *change
organisational relationships* permission.

**When** Root submits `POST /users/<aliceId>/relationships` with `{ type: 'direct', targetId: <bobId> }` from the dedicated organisational-relationship screen.

**Then** the response is `201` and a `Relationship` row is created (`type: 'direct'`, Alice reports to Bob); Alice's Reporting-line access resolves through Bob on the next request.

> **Stage-2 blocked on CC-07 (AD-19 Journal gate).** The scenario prose may
> proceed. The Then-clause *"and one before/after journal record commits in the
> same transaction as the fact change"* is **stage-2 blocked on CC-07** — the
> immutable relationship/access-journal schema, snapshot payload, and
> transaction-enrolment contract are not yet defined. `UserEvents` is not a
> journal substitute. Until CC-07, the atomic-journal assertion stays unwritten.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice has no `direct` edge; Root holds *change organisational relationships*.

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
