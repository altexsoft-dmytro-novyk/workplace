# UM-LIST-04 · Active-only filter excludes deactivated users

**Trace:** epics.md Story 1.5 · FR-9/FR-16 · `um-deact-02`

## Scenario

**Given** Colin is deactivated (`isActive: false`).

**When** Root lists users with `isActive=true`.

**Then** Colin does not appear in the result set.

**Preconditions:** [fixture](../README.md#canonical-personas); Colin deactivated per `um-deact-01`.

## Test

- **inputURL:** `GET /users?isActive=true`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Root>" } }
  ```
- **expectedResult:** `200`; results do not contain Colin's `id`.
