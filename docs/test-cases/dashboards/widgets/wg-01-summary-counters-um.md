# DB-WG-01 · Summary counters widget for Unit Manager

**Trace:** §4.4.1 · AD-17

## Scenario

**Given** Bob is Unit Manager of Alice and other subordinates with known active risks, open action items, resourcing requests, and campaigns.

**When** Bob fetches data for the `summary-counters` widget.

**Then** the returned metrics accurately reflect the subordinate headcount, breakdown of active risks by level, open and overdue action items, active resourcing requests, and open form campaigns for Bob's direct reporting tree.

**Preconditions:** [fixture](../README.md); Bob manages subordinates including Alice; seeded risk and action item records exist.

## Test

- **inputURL:** `GET /api/widgets/summary-counters/data`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200 OK`; JSON body containing:
  ```json
  {
    "headcount": 1,
    "activeRisksByLevel": {
      "low": 0,
      "needAttention": 1,
      "medium": 0,
      "high": 0,
      "leaver": 0
    },
    "openActionItems": 2,
    "overdueActionItems": 1,
    "activeResourcingRequests": 1,
    "openFormCampaigns": 1
  }
  ```
