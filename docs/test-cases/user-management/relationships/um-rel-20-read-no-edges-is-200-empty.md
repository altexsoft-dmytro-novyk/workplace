# UM-REL-20 · Read relationships — an active employee with no edges is `200 { data: [] }`, never `404`

**Trace:** epics.md Story 6.1 (Epic 6) · [spec-6-1](../../../../_bmad-output/implementation-artifacts/user-management/spec-6-1-read-current-manager-and-people-partner.md) · PRD FR-10 · [api-conventions.md](../../../architecture/api-conventions.md) · PM/AD-24 (five-clause denial oracle)

The distinction this file pins: **`404` is about the subject, not about the
payload.** An active employee who happens to have no manager and no People
Partner is a perfectly resolvable subject with an empty relationship set.
Returning `404` there would make "this person has no manager yet" indistinguishable
from "this person does not exist", and the frontend would render an error page
for a new hire.

## Scenario

**Given** an active employee T with no `direct` and no `people_partner` edge,
and a viewer V who holds `org:relationships:write`.

**When** V calls `GET /users/<T>/relationships`.

**Then** `200` with an empty array — not `404`, and not a body without `data`.

## Test

- **inputURL:** `GET /api/v1/users/<targetId>/relationships`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<viewerId>>" } }`
- **expectedResult:** `200`, body **deep-equals** `{ "data": [] }`

**Preconditions:** [fixture](../README.md#canonical-personas). V is granted the
capability through a real FR-policy chain, not a role-name check.
