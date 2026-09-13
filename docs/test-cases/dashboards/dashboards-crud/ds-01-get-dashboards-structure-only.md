# DB-DS-01 · Get dashboards returns structure only

**Trace:** §4.4 · AD-14 · AD-15 · AD-17

## Scenario

**Given** Bob (Unit Manager) requests his dashboards list.

**When** the response is received.

**Then** it returns the dashboard metadata (id, title, icon, order, createdBy, accessRole) and its associated widgets (id, dashboardId, type, config), but business payloads (e.g. employee lists, counters, risk records) are completely absent.

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
- **expectedResult:** `200 OK`; array of dashboards matching:
  ```json
  [
    {
      "id": "<uuidv7>",
      "title": "Unit Management",
      "icon": "users",
      "order": 1,
      "accessRole": "unit-manager",
      "widgets": [
        {
          "id": "<uuidv7>",
          "dashboardId": "<uuidv7>",
          "type": "summary-counters",
          "config": {}
        },
        {
          "id": "<uuidv7>",
          "dashboardId": "<uuidv7>",
          "type": "people-table",
          "config": {}
        }
      ]
    }
  ]
  ```
  *(Business payload fields such as `employees`, `counts`, `risks` are absent from the dashboard JSON)*
