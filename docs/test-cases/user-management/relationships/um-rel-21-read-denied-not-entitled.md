# UM-REL-21 · Read relationships — visible subject, unentitled viewer → `403` leak-free (Self included)

**Trace:** epics.md Story 6.1 (Epic 6) · [spec-6-1](../../../../_bmad-output/implementation-artifacts/user-management/spec-6-1-read-current-manager-and-people-partner.md) · PRD FR-10 · PM/AD-24 (five-clause denial oracle) · access-control.md ACM-5 · product decision 2026-09-04 ("Option B")

The `403` leg of the gate, and the decision most likely to surprise a reader:
**Self is not a reader of their own relationships.** The Option B gate is
`∩ { reporting, pp } ≠ ∅ OR isAllowed(…'org:relationships:write')`, and the
`self` audience is in neither set. An employee who wants to know who their
manager is reads it from their own profile card (S1), not from this route.

## Scenario-stage decisions (for the human gate)

- **Denial body is leak-free.** A `403` here confirms the subject exists — that
  is already implied by reaching the gate at all (`um-rel-23` decides `404`
  first) — but it must not disclose *any* relationship fact. Specifically: no
  manager id, and not even the string `people_partner`, which would betray that
  a PP edge exists.

## Scenario — Test 1 (colleague)

**Given** an active employee T with a current `direct` edge to a manager, and
an employee O who resolves only the `colleague` audience over T and holds no
`org:relationships:write`.

**When** O calls `GET /users/<T>/relationships`.

**Then** `403`, with a body carrying no relationship data.

## Scenario — Test 2 (Self)

**Given** the same T, with a current `direct` edge to a manager.

**When** T calls `GET /users/<T>/relationships` for their own id, holding no
capability.

**Then** `403` — the `self` audience is not a reader.

## Test

- **Test 1 — colleague denied**
  - **inputURL:** `GET /api/v1/users/<targetId>/relationships`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<outsiderId>>" } }`
  - **expectedResult:** `403`; body is leak-free for the target; the serialized
    body contains **neither** the manager's id **nor** the literal
    `people_partner`
- **Test 2 — Self denied**
  - **inputURL:** `GET /api/v1/users/<targetId>/relationships`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<targetId>>" } }`
  - **expectedResult:** `403`

**Preconditions:** [fixture](../README.md#canonical-personas). Because the
outcome depends on **real** Phase-0 audiences, real `User` + `Relationship` rows
are seeded and the header is the seeded-uuid shorthand.
