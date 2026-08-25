# DB-DS-03 · Create dashboard with invalid payload fails

**Trace:** AD-15

## Scenario

**Given** a request to create a custom dashboard is missing mandatory fields (e.g. empty title).

**When** the request is sent to `/api/dashboards`.

**Then** the request fails with 400 Bad Request and validation error messages.

**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `POST /api/dashboards`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "title": "",
      "icon": "star",
      "widgets": []
    }
  }
  ```
- **expectedResult:** `400 Bad Request`; validation error detailing that `title` cannot be empty
