# DB-PR-04 · People Partner preset strictly excludes resourcing widgets

**Trace:** §4.4.4 · AD-18

## Scenario

**Given** Paula is an authenticated People Partner.

**When** she requests the dashboards list.

**Then** the response includes the `people-partner` preset dashboard containing people and HR widgets (`summary-counters`, `people-table`, `my-action-items`, `quick-nav`, HR widgets), and `my-resourcing-requests` is STRICTLY ABSENT.

**Preconditions:** [fixture](../README.md); seeded presets exist.

## Test

- **inputURL:** `GET /api/dashboards`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200 OK`; list contains dashboard with `accessRole: "people-partner"` where:
  - widgets contain `summary-counters`, `people-table`, `my-action-items`, `quick-nav` (and optional HR widgets like `incomplete-profiles`, `upcoming-cds`)
  - widget of `type: "my-resourcing-requests"` is completely ABSENT from the array
