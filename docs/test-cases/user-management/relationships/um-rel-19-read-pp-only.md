# UM-REL-19 · Read relationships — People Partner only, read by the assigned PP

**Trace:** epics.md Story 6.1 (Epic 6) · [spec-6-1](../../../../_bmad-output/implementation-artifacts/user-management/spec-6-1-read-current-manager-and-people-partner.md) · PRD FR-10 · product decision 2026-09-04 ("Option B" read gate)

Companion to [`um-rel-18`](./um-rel-18-read-manager-and-pp-both-set.md): the
`pp` half of the audience gate, and the projection when only one edge exists.
The absence of a manager is not an error and not a gap in the payload — the
array simply carries one entry.

## Scenario

**Given** an active employee T has a current `people_partner` edge to Priya Pole
and **no** `direct` edge.

**When** Priya — T's assigned People Partner — calls
`GET /users/<T>/relationships`.

**Then** `200` with a single `people_partner` edge.

## Test

- **inputURL:** `GET /api/v1/users/<targetId>/relationships`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<priyaId>>" } }`
- **expectedResult:** `200`
  - `data` has length `1`
  - `data[0].type === 'people_partner'`
  - `data[0].target === { id: <priyaId>, firstName: 'Priya', lastName: 'Pole' }`

**Preconditions:** [fixture](../README.md#canonical-personas).
