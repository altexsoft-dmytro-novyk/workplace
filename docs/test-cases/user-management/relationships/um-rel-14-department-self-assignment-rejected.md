# UM-REL-14 · Making yourself a department's manager is rejected

**Trace:** epics.md Story 4.3 · PRD FR-10 · access-control.md §3.3 ("rejects self-assignment") · AD-19

> **BLOCKED — CC-07 + Department edge contract; scenario prose only.**

## Scenario

**Given** Root holds the *change organisational relationships* permission and is
not already entitled to manage Department B.

**When** Root submits a change making itself the manager of Department B.

**Then** the request is rejected, no access changes, and no journal record is
written — self-assignment is refused for the department-manager fact exactly as
for manager and People Partner (§3.3).

**Preconditions:** [fixture](../README.md#canonical-personas); Root does not manage Department B; Root holds *change organisational relationships*.

## Test

- **inputURL:** *(department-manager change route — owned by the Department edge contract)*
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" }, "body": { "departmentId": "<deptBId>", "managerId": "<rootId>" } }`
- **expectedResult:** rejected; Department B's manager unchanged; no journal record. **(BLOCKED.)**
