# DB-PR-03 · Project Manager preset structure & widget set

**Trace:** §4.4.3 · AD-18

## Scenario

**Given** Pete is an authenticated Project Manager for project Phoenix.

**When** he requests the dashboards list.

**Then** the response includes a preset dashboard with `accessRole: "project-manager"` containing identical widget types to the Delivery Manager preset (`project-selector`, `summary-counters`, `project-people-tables`, `my-resourcing-requests`, `quick-nav`).

**Preconditions:** [fixture](../README.md); seeded presets exist.

## Test

- **inputURL:** `GET /api/dashboards`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:pete>"
    }
  }
  ```
- **expectedResult:** `200 OK`; list contains a dashboard with `accessRole: "project-manager"` whose `widgets` array contains:
  - widget with `type: "project-selector"`
  - widget with `type: "summary-counters"`
  - widget with `type: "project-people-tables"`
  - widget with `type: "my-resourcing-requests"`
  - widget with `type: "quick-nav"`
