# DB-DS-04 · Custom dashboard user isolation

**Trace:** AD-15 · AD-17

## Scenario

**Given** Bob creates a custom dashboard "Bob Private View".

**When** Paula (People Partner) requests her dashboard list.

**Then** Bob's custom dashboard is completely absent from Paula's response.

**Preconditions:** [fixture](../README.md); Bob has created a custom dashboard.

## Test 1 — Bob verifies his custom dashboard

- **inputURL:** `GET /api/dashboards`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200 OK`; list contains dashboard with `title: "Bob Private View"`

## Test 2 — Paula requests her dashboard list

- **inputURL:** `GET /api/dashboards`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200 OK`; list does NOT contain any dashboard with `title: "Bob Private View"` or `createdBy: "<uuid:bob>"`
