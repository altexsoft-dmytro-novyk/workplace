# DB-WG-02 · Summary counters widget for Delivery Manager all vs filtered

**Trace:** §4.4.2 · AD-17

## Scenario

**Given** Dave is Delivery Manager for project Phoenix and project Orion.

**When** Dave fetches `summary-counters` without query parameters, counters aggregate across all his managed projects. When he adds `?projectId=<uuid:phoenix>`, counters recalculate for project Phoenix only.

**Preconditions:** [fixture](../README.md); Dave is DM for Phoenix (Alice member, 1 risk) and Orion (Bob member, 0 risks).

## Test 1 — All projects default

- **inputURL:** `GET /api/widgets/summary-counters/data`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200 OK`; aggregated metrics across Phoenix + Orion (`headcount: 2`, `activeRisksByLevel: { ... }`)

## Test 2 — Filtered by single project

- **inputURL:** `GET /api/widgets/summary-counters/data?projectId=<uuid:phoenix>`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200 OK`; metrics scoped solely to project Phoenix (`headcount: 1`)
