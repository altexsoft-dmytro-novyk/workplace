# AC-M-S15-PP-R · pp read s15

**Trace:** §3.2 S15 · AD-10

## Scenario

**Given** Paula is Alice's assigned people partner.

**When** Paula reads Alice's Request history section.

**Then** the request succeeds and the section data is present in the response — the §3.2 pp cell grants read.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Request history data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/request-history`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Paula>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `requesthistory` present; at least one request-history entry with `type` and `occurredAt`
