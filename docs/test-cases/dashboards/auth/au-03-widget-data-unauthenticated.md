# DB-AU-03 · Widget data fetch without authorization

**Trace:** global auth rule (README) · AD-17 · AD-19

## Scenario

**Given** a request arrives with an empty authorization header.

**When** it attempts to fetch data for the `summary-counters` widget.

**Then** it is rejected with 401 Unauthorized and no counter data is returned.

**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `GET /api/widgets/summary-counters/data`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": ""
    }
  }
  ```
- **expectedResult:** `401 Unauthorized`; empty/error body
