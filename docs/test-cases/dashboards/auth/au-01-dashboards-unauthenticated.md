# DB-AU-01 · Dashboards list without authorization

**Trace:** global auth rule (README) · AD-19

## Scenario

**Given** a request arrives with an empty authorization header.

**When** it attempts to retrieve the dashboards list.

**Then** it is rejected with 401 Unauthorized and no dashboard data is returned.

**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `GET /api/dashboards`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": ""
    }
  }
  ```
- **expectedResult:** `401 Unauthorized`; empty/error body
