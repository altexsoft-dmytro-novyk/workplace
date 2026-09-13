# DB-WG-07 · Unknown widget type returns 404

**Trace:** AD-16 · AD-17

## Scenario

**Given** a client requests data for an unrecognized widget type identifier that is not in the code registry.

**When** the request is made to `/api/widgets/non-existent-widget-type/data`.

**Then** the backend fails closed and returns 404 Not Found.

**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `GET /api/widgets/non-existent-widget-type/data`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `404 Not Found`; error indicating unknown widget type
