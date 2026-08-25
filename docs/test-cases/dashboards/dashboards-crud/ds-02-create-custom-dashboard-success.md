# DB-DS-02 · Create custom dashboard success

**Trace:** §4.4 · AD-15 · AD-17

## Scenario

**Given** Bob wants to create a custom dashboard with a specific subset of widgets.

**When** he submits a valid POST request to `/api/dashboards`.

**Then** a new dashboard entity is created with `accessRole: null`, `createdBy` set to Bob's user ID, and the specified widgets attached.

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
      "title": "Bob Custom Overview",
      "icon": "star",
      "order": 2,
      "widgets": [
        {
          "type": "summary-counters",
          "config": { "filter": "active" }
        },
        {
          "type": "my-action-items",
          "config": { "limit": 5 }
        }
      ]
    }
  }
  ```
- **expectedResult:** `201 Created`; returns created dashboard object:
  ```json
  {
    "id": "<uuidv7>",
    "title": "Bob Custom Overview",
    "icon": "star",
    "order": 2,
    "createdBy": "<uuid:bob>",
    "accessRole": null,
    "widgets": [
      {
        "id": "<uuidv7>",
        "dashboardId": "<uuidv7>",
        "type": "summary-counters",
        "config": { "filter": "active" }
      },
      {
        "id": "<uuidv7>",
        "dashboardId": "<uuidv7>",
        "type": "my-action-items",
        "config": { "limit": 5 }
      }
    ]
  }
  ```
