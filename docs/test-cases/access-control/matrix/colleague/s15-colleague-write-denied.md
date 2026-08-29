# AC-M-S15-CO-W-DEN · colleague write s15 denied (no access)

**Trace:** §3.2 S15 · AD-10

## Scenario

**Given** Colin has no §3.2 access to Alice's Request history (`—` cell).

**When** Colin attempts to mutate Alice's Request history.

**Then** the API returns leak-free `404` — same as a nonexistent section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Request history data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/request-history`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; leak-free body
