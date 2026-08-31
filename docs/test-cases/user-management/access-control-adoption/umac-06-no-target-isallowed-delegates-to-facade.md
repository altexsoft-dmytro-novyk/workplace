# UMAC-06 · No-target `isAllowed` delegates straight to the real facade

**Trace:** SPEC-user-management-access-control-adoption CAP-1 · `um-integration-contract-response.md` Q2 (the non-target `isAllowed` moves to the facade in the same cutover) · access-control.md §"Functional-role Kernel MVP" (seeded catalog is exactly `create`/`deactivate`/`list`), §49 (`position === 'HR Admin'` prohibited) · ACM-2 (`AccessControlFacade.isAllowed`) · DEC-UM-002

## Scenario

**Given** the port is rebound to the real adapter, whose `isAllowed(userId,
feature)` delegates directly to `AccessControlFacade.isAllowed`; the interim
adapter's `actor.position === 'HR Admin'` check is deleted.

**When** sessions call the three no-target routes:

- the seeded HR-Admin **root** `User` calls `GET /users`, `POST /users` (still
  present pre-Epic-1), `DELETE /users/:id` — features `user-management:list`,
  `:create`, `:deactivate`, which are **exactly** the three ACM-1 seeded keys
  granted to the one `hr-admin` FR policy;
- an unrelated active `User` with no FR attachment calls the same routes;
- **Ida** (holds an unrelated functional permission but not these) calls them.

**Then** the root session is **allowed** on all three (the facade finds the live
FR grant chain); the unrelated session and Ida are **denied** (`403`) — the
facade branches on no permission key, never compares a role name or
`User.position`, and an absent or non-matching grant denies.

**Preconditions:** [fixture](README.md#fixture-convention-per-um-integration-contract-response-md-q6); ACM-0 + ACM-1 completed (root holds `hr-admin` FR); an unrelated active `User` and Ida exist; the port is rebound.

## Test

- **Test 1 — root allowed**
  - **inputURL:** `GET /users`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<root-uuid>>" } }`
  - **expectedResult:** `200`.
- **Test 2 — unrelated session denied**
  - **inputURL:** `GET /users` with `Bearer <token:<unrelated-uuid>>`
  - **expectedResult:** `403`.
- **Test 3 — Ida denied (permission granularity, DEC-UM-002)**
  - **inputURL:** `GET /users` with `Bearer <token:<ida-uuid>>`
  - **expectedResult:** `403` — holding *a* functional permission is not holding *this* one.
