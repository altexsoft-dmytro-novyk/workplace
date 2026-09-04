# UM-REL-24 · Read relationships — no or unresolvable session → `401`

**Trace:** epics.md Story 6.1 (Epic 6) · [spec-6-1](../../../../_bmad-output/implementation-artifacts/user-management/spec-6-1-read-current-manager-and-people-partner.md) · PRD FR-10 · PM/AD-24 (five-clause denial oracle) · Story 2.2 (session establishment)

## Scenario-stage decisions (for the human gate)

- **`401` outranks `404`.** An unauthenticated caller gets `401` even when the
  `:id` is a perfectly valid active employee — authentication is decided before
  the subject lookup. The reverse order would let an anonymous caller enumerate
  which uuids exist.
- **A well-formed token naming nobody is `401`, not `403`.** There is no
  principal to authorize, so the request never reaches the gate.

## Scenario — Test 1 (no header)

**Given** an active employee T.

**When** `GET /users/<T>/relationships` is called with no `Authorization`
header.

**Then** `401`.

## Scenario — Test 2 (token resolving to nobody)

**Given** the same T, and a syntactically valid bearer token whose subject is a
uuid that names no `User`.

**When** that token is used against the same route.

**Then** `401` — not `403`, and not `404`.

## Test

- **Test 1 — no `Authorization` header**
  - **inputURL:** `GET /api/v1/users/<targetId>/relationships`
  - **inputRequest:** `{ "headers": {} }`
  - **expectedResult:** `401`
- **Test 2 — bearer resolving to nobody**
  - **inputURL:** `GET /api/v1/users/<targetId>/relationships`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<unseeded-uuidv7>>" } }`
  - **expectedResult:** `401`

**Preconditions:** [fixture](../README.md#canonical-personas).
