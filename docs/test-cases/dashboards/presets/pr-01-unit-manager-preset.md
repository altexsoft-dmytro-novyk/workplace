# DB-PR-01 · Unit Manager preset structure & widget set

**Trace:** §4.4.1 · AD-18

## Scenario

**Given** Bob is an authenticated Unit Manager.

**When** he requests the dashboards list.

**Then** the response includes a preset dashboard with `accessRole: "unit-manager"` containing the required widgets: `summary-counters`, `people-table`, `my-action-items`, and `quick-nav`.

**Preconditions:** [fixture](../README.md); seeded presets exist.

## Test

- **inputURL:** `GET /api/dashboards`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200 OK`; list contains a dashboard with `accessRole: "unit-manager"` whose `widgets` array contains at least:
  - widget with `type: "summary-counters"`
  - widget with `type: "people-table"`
  - widget with `type: "my-action-items"`
  - widget with `type: "quick-nav"`
