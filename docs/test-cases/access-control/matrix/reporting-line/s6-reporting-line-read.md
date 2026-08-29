# AC-M-S6-RE-R · reporting-line read s6

**Trace:** §3.2 S6 · AD-10

## Scenario

**Given** Bob is Alice's Reporting line (direct unit manager).

**When** Bob reads Alice's Risks section.

**Then** the request succeeds and the section data is present in the response — the §3.2 reporting line cell grants read.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Risks data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/risks`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `risks` present; risk `level` and `description` present
