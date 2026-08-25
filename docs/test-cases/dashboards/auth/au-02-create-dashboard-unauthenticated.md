# DB-AU-02 · Create dashboard without authorization

**Trace:** global auth rule (README) · AD-19

## Scenario

**Given** a request arrives with an empty authorization header.

**When** it attempts to create a custom dashboard.

**Then** it is rejected with 401 Unauthorized and no dashboard is created.

**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `POST /api/dashboards`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": ""
    },
    "body": {
      "title": "My New Dashboard",
      "icon": "layout",
      "widgets": []
    }
  }
  ```
- **expectedResult:** `401 Unauthorized`; no dashboard record created
