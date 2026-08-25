# DB-WG-06 · HR widgets scoped to People Partner assigned employees

**Trace:** §4.4.4 · AD-17

## Scenario

**Given** Paula is People Partner assigned to Alice. Alice has an incomplete profile section and an upcoming CDS assessment. Colin has Paula assigned to someone else.

**When** Paula fetches data for `incomplete-profiles` and `upcoming-cds` widgets.

**Then** the widgets return items for Alice only; Colin's profile/CDS status is absent.

**Preconditions:** [fixture](../README.md); Paula assigned as PP for Alice.

## Test 1 — Incomplete profiles widget

- **inputURL:** `GET /api/widgets/incomplete-profiles/data`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200 OK`; list includes Alice with missing fields; Colin is absent

## Test 2 — Upcoming CDS widget

- **inputURL:** `GET /api/widgets/upcoming-cds/data`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200 OK`; list includes Alice's scheduled assessment; Colin is absent
