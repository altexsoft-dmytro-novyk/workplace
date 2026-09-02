# UM-LIST-07 · The list endpoint is gated by the no-target `user-management:list` capability

**Trace:** epics.md Story 1.5 · PRD FR-15 · [access-control.md](../../../architecture/access-control.md)
§"The AccessControl facade" (AD-9), §"Denial conventions" · AD-4 (no role-name
checks) · global 401 rule ([../../README.md](../../README.md)) · mirrors
`access-control-adoption/umac-06`

## Scenario

**Given** the production `ACCESS_CONTROL_PORT` is bound to the real
`AccessControlFacade`-backed adapter. `GET /users` is guarded by a **no-target**
capability check — `isAllowed(callerId, 'user-management:list')` — with **no**
`User.position` / role-name comparison and **no** per-target audience walk (it is
a directory-wide read, not a per-employee one).

**When** three callers hit `GET /users`: Root (whose `hr-admin` FR grant carries
`user-management:list`), Ida (an authenticated seeded employee whose only
functional-role permission is unrelated — `create form campaigns`), and an
unauthenticated request.

**Then**:

- Root → `200` with the paginated envelope;
- Ida → `403`, leak-free body, no list data — an active session but the facade's
  no-target `isAllowed` returns `false`;
- no / invalid token → `401` (the session layer never resolves an active
  `User`), before any capability check.

**Preconditions:** [fixture](../README.md#canonical-personas); Root has a live
`hr-admin` FR grant chain; Ida has her unrelated custom functional role; both are
active `User` rows.

## Test

- **Test 1 — entitled caller**
  - **inputURL:** `GET /users`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Root>" } }
    ```
  - **expectedResult:** `200`; body is `{ items, page, pageSize, total, totalPages }`.

- **Test 2 — authenticated caller without the capability**
  - **inputURL:** `GET /users`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Ida>" } }
    ```
  - **expectedResult:** `403`; leak-free body (no counts, no `items` key); nothing
    about the population is disclosed.

- **Test 3 — unauthenticated caller**
  - **inputURL:** `GET /users`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "" } }
    ```
  - **expectedResult:** `401`; no list data.
