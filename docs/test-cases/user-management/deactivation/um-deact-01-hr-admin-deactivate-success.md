# UM-DEACT-01 · HR Admin deactivates a user

**Trace:** PRD Data Model — User.isActive ("soft delete — deactivating a user flips this rather than removing the row") · [DEC-UM-002](../../../architecture/user-management-test-decisions.md) (HR Admin capability gates deactivation)

## Scenario

**Given** Root, holder of the HR Admin functional role, and Colin, an active user.

**When** Root deactivates Colin.

**Then** `Colin.isActive` flips to `false`; the row itself is not removed and a direct read still returns it.

**Preconditions:** [fixture](../README.md#canonical-personas); Colin seeded with `isActive: true`.

## Test

- **Test 1 — the write**
  - **inputURL:** `DELETE /users/<colinId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; body reflects `isActive: false`.
- **Test 2 — the row survives**
  - **inputURL:** `GET /users/<colinId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; full record returned with `isActive: false` — not a `404`.
