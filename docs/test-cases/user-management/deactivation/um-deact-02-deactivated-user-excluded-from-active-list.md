# UM-DEACT-02 · A deactivated user is excluded from the active-only listing

**Trace:** PRD Data Model — User.isActive

## Scenario

**Given** Colin has been deactivated (`um-deact-01`).

**When** Root lists users with the active-only filter.

**Then** Colin does not appear in the result set, though his record still exists.

**Preconditions:** [fixture](../README.md#canonical-personas); Colin seeded active, then deactivated per `um-deact-01`.

## Test

- **inputURL:** `GET /users?isActive=true`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Root>" } }
  ```
- **expectedResult:** `200`; response list does not contain Colin's `id`.
