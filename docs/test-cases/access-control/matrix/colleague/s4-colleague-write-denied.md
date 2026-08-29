# AC-M-S4-CO-W-DEN · colleague write s4 denied (no access)

**Trace:** §3.2 S4 · AD-10

## Scenario

**Given** Colin has no §3.2 access to Alice's Employment (`—` cell).

**When** Colin attempts to mutate Alice's Employment.

**Then** the API returns leak-free `404` — same as a nonexistent section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Employment data for Alice.

## Test

- **inputURL:** `PATCH /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; leak-free body
