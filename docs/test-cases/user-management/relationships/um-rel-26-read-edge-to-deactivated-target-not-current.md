# UM-REL-26 · Read relationships — an edge whose target is deactivated is not a current edge

**Trace:** epics.md Story 6.1 (Epic 6) · [spec-6-1](../../../../_bmad-output/implementation-artifacts/user-management/spec-6-1-read-current-manager-and-people-partner.md) · PRD FR-10 · AD-11 (hard-delete edge model) · Epic 5 (Departure)

## Scenario-stage decisions (for the human gate)

- **"Current" is a property of the target, not only of the row.** Edges are
  hard-deleted rather than closed (AD-11), so a manager's departure leaves the
  `direct` row intact until someone reassigns it. Projecting that row would tell
  the employee they report to a person who has left the company.
- **The filter is on the target's `isActive`,** applied in the projection — not
  a cleanup job on the edge table. The row stays; it simply stops being
  *current*.

## Scenario

**Given** an active employee T with a `direct` edge to a manager M, and M is
subsequently deactivated (the edge row survives).

**When** a viewer H holding `org:relationships:write` calls
`GET /users/<T>/relationships`.

**Then** `200` with an empty array — the surviving edge is not current.

## Test

- **inputURL:** `GET /api/v1/users/<targetId>/relationships`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<hrId>>" } }`
- **expectedResult:** `200`, body **deep-equals** `{ "data": [] }`

**Preconditions:** [fixture](../README.md#canonical-personas). M is seeded
active, the edge is created, then M's `isActive` is set to `false` — the order
matters, because creating the edge against an already-inactive user is a
different (write-path) scenario.
