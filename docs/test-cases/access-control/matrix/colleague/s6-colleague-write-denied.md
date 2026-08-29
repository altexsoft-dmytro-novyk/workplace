# AC-M-S6-CO-W-DEN · colleague write s6 denied (no access)

**Trace:** §3.2 S6 · AD-10

## Scenario

**Given** Colin has no §3.2 access to Alice's Risks (`—` cell).

**When** Colin attempts to mutate Alice's Risks.

**Then** the API returns leak-free `404` — same as a nonexistent section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Risks data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/risks`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; leak-free body
