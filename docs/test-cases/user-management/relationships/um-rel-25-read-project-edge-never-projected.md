# UM-REL-25 · Read relationships — a `project` edge on the subject is never returned

**Trace:** epics.md Story 6.1 (Epic 6) · [spec-6-1](../../../../_bmad-output/implementation-artifacts/user-management/spec-6-1-read-current-manager-and-people-partner.md) · PRD FR-10 · [database-schema.md](../../../architecture/database-schema.md) §Relationship

`Relationship` is one table carrying several edge kinds. This route projects
**two** of them. A `project` edge is a real row on the same subject with a
`projectId` instead of a person target, so a projection written as "select the
subject's relationships" rather than "select the subject's `direct` and
`people_partner` relationships" would emit a row with no `target` and break the
response contract in `um-rel-18`.

## Scenario

**Given** an active employee T with a current `direct` edge to Meg Manager
**and** a `type: 'project'` `Relationship` row pointing at a `Project`, and a
viewer H holding `org:relationships:write`.

**When** H calls `GET /users/<T>/relationships`.

**Then** `200` with exactly the one `direct` edge; no entry of type `project`.

## Test

- **inputURL:** `GET /api/v1/users/<targetId>/relationships`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<hrId>>" } }`
- **expectedResult:** `200`
  - `data` has length `1`
  - `data[0].type === 'direct'`
  - no element of `data` has `type === 'project'`

**Preconditions:** [fixture](../README.md#canonical-personas). The `project`
edge and its `Project` row are seeded directly and torn down with the run.
