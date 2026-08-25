# DB-AU-05 · View dashboard without permission denied

**Trace:** §2.3 · AD-9 · AD-17

## Scenario

**Given** user Eve has a valid session token but has NOT been granted the `view-dashboard` functional permission.

**When** she attempts to fetch the dashboards list.

**Then** the request is rejected with 403 Forbidden.

**Preconditions:** [fixture](../README.md); Eve lacks `view-dashboard` permission in `UserPolicies`.

## Test

- **inputURL:** `GET /api/dashboards`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:eve>"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; error indicating insufficient permissions
