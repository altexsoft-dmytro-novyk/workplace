# UM-REL-23 · Read relationships — unknown or inactive `:id` → `404` leak-free, decided before the gate

**Trace:** epics.md Story 6.1 (Epic 6) · [spec-6-1](../../../../_bmad-output/implementation-artifacts/user-management/spec-6-1-read-current-manager-and-people-partner.md) · PRD FR-10 · PM/AD-24 (five-clause denial oracle)

## Scenario-stage decisions (for the human gate)

- **Ordering is the assertion.** The subject check runs **before** any audience
  resolution. If the gate ran first, an unentitled viewer probing a random uuid
  would get `403` for a real user and `404` for a fake one — an existence oracle
  for the whole directory. Deciding `404` first collapses both to `404`.
- **Inactive is indistinguishable from absent.** A deactivated employee is not a
  readable subject; the response must not reveal that the id was ever valid.

## Scenario — Test 1 (unknown id)

**Given** a viewer V holding `org:relationships:write`, and a uuid that names no
`User`.

**When** V calls `GET /users/<unknown-uuid>/relationships`.

**Then** `404`, leak-free.

## Scenario — Test 2 (inactive user)

**Given** the same V, and an employee I whose `isActive` is `false`.

**When** V calls `GET /users/<I>/relationships`.

**Then** `404`, leak-free — with no field of I's identity in the body.

## Test

- **Test 1 — unknown id**
  - **inputURL:** `GET /api/v1/users/<random-uuidv7>/relationships`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<viewerId>>" } }`
  - **expectedResult:** `404`; leak-free body
- **Test 2 — inactive user**
  - **inputURL:** `GET /api/v1/users/<inactiveId>/relationships`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<viewerId>>" } }`
  - **expectedResult:** `404`; leak-free body for the inactive user

**Preconditions:** [fixture](../README.md#canonical-personas).
