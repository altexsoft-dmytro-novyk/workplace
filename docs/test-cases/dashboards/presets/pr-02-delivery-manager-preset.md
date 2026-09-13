# DB-PR-02 · Delivery Manager preset structure & widget set

**Trace:** §4.4.2 · AD-18

## Scenario

**Given** Dave is an authenticated Delivery Manager for project Phoenix.

**When** he requests the dashboards list.

**Then** the response includes a preset dashboard with `accessRole: "delivery-manager"` containing the required widgets: `project-selector`, `summary-counters`, `project-people-tables`, `my-resourcing-requests`, and `quick-nav`.

**Preconditions:** [fixture](../README.md); seeded presets exist.

## Test

- **inputURL:** `GET /api/dashboards`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200 OK`; list contains a dashboard with `accessRole: "delivery-manager"` whose `widgets` array contains at least:
  - widget with `type: "project-selector"`
  - widget with `type: "summary-counters"`
  - widget with `type: "project-people-tables"`
  - widget with `type: "my-resourcing-requests"`
  - widget with `type: "quick-nav"`
