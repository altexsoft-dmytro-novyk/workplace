# UM-REL-22 · Read relationships — capability holder with no edge reads (edit implies read)

**Trace:** epics.md Story 6.1 (Epic 6) · [spec-6-1](../../../../_bmad-output/implementation-artifacts/user-management/spec-6-1-read-current-manager-and-people-partner.md) · PRD FR-10 · DEC-UM-002 (no-target facade `isAllowed`, never a role-name check) · product decision 2026-09-04 ("Option B")

The second half of the Option B gate. Whoever may **change** an employee's
manager or People Partner must be able to **see** the current value first —
otherwise the reassignment flow cannot obtain the `relationshipId` that
DEC-UM-005's explicit `DELETE`-then-`POST` requires, nor seed the PP
`expectedCurrentTargetId` optimistic-concurrency token.

## Scenario-stage decisions (for the human gate)

- **Capability, not role.** The gate is
  `isAllowed(viewer, 'org:relationships:write')` through the facade with no
  target — never an `hr-admin` role-name check (DEC-UM-002).
- **No audience required.** The holder needs no `reporting`/`pp` edge to the
  subject. That is the point: HR reads across the organisation.

## Scenario

**Given** an active employee T with a current `direct` edge to Max Boss, and a
viewer H who holds `org:relationships:write` and has **no** reporting or PP edge
to T.

**When** H calls `GET /users/<T>/relationships`.

**Then** `200` with T's current edges.

## Test

- **inputURL:** `GET /api/v1/users/<targetId>/relationships`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<hrId>>" } }`
- **expectedResult:** `200`
  - `data` has length `1`
  - `data[0].type === 'direct'`
  - `data[0].target === { id: <maxId>, firstName: 'Max', lastName: 'Boss' }`

**Preconditions:** [fixture](../README.md#canonical-personas). The capability is
granted through a real FR-policy chain.
