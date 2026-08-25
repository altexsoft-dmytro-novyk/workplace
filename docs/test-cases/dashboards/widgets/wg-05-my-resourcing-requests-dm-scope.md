# DB-WG-05 · Resourcing requests widget for Delivery Manager scope

**Trace:** §4.4.2 · AD-17

## Scenario

**Given** Dave is Delivery Manager of project Phoenix, and Pete is Project Manager of project Phoenix. Pete created a resourcing request R1 for Phoenix, and Dave created request R2 for Phoenix. Colin created request R3 for an unrelated project.

**When** Dave fetches data for `my-resourcing-requests` widget.

**Then** Dave receives requests R1 and R2 (all requests for his managed projects), while unrelated request R3 is completely absent.

**Preconditions:** [fixture](../README.md); seeded resourcing requests exist.

## Test

- **inputURL:** `GET /api/widgets/my-resourcing-requests/data`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200 OK`; returns array containing:
  - request R1 created by Pete (`projectId: "<uuid:phoenix>"`)
  - request R2 created by Dave (`projectId: "<uuid:phoenix>"`)
  - does NOT contain request R3 (`id: "<uuid:r3>"` is absent)
