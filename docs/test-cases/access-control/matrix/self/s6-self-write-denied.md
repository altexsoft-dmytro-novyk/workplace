# AC-M-S6-SE-W-DEN · self write s6 denied (no access)

**Trace:** §3.2 S6 · AD-10

## Scenario

**Given** Alice has no §3.2 access to Alice's Risks (`—` cell).

**When** Alice attempts to mutate Alice's Risks.

**Then** the API returns leak-free `404` — same as a nonexistent section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Risks data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/risks`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; leak-free body
