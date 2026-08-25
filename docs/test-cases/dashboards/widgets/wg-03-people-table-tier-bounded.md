# DB-WG-03 · People table widget is bounded by AccessControl tier

**Trace:** §2.3 · §4.4.1 · AD-9 · AD-10 · AD-17

## Scenario

**Given** Bob is Unit Manager for Alice, but has no managerial relationship over Colin.

**When** Bob fetches data for the `people-table` widget.

**Then** Alice appears in the results with risk status, project, leave status, and profile link, but Colin is completely absent.

**Preconditions:** [fixture](../README.md); Bob manages Alice; Colin is an unrelated employee.

## Test

- **inputURL:** `GET /api/widgets/people-table/data`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200 OK`; returns array of people records:
  - contains Alice (`id: "<uuid:alice>"`, `name: "Alice"`, `riskStatus: "needAttention"`, `project: "Phoenix"`, `leaveStatus: "active"`, `profileUrl: "/users/<uuid:alice>"`)
  - does NOT contain Colin (`id: "<uuid:colin>"` is absent)
