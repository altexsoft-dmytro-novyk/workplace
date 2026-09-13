# DB-AU-04 · Mock HR Admin unblocks dashboard operations

**Trace:** AD-19

## Scenario

**Given** User Management full auth is not yet integrated and the session principal is configured with mock HR Admin rights.

**When** a dashboard request is made with the mock session token.

**Then** the request is accepted (200 OK) and passes through the AccessControl facade shapes without throwing auth bypass errors.

**Preconditions:** [fixture](../README.md); mock principal configured per AD-19.

## Test

- **inputURL:** `GET /api/dashboards`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:root>"
    }
  }
  ```
- **expectedResult:** `200 OK`; returns array of dashboards accessible to the admin persona
