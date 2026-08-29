# AC-M-S5-CO-W-DEN · colleague write s5 denied (no access)

**Trace:** §3.2 S5 · AD-10

## Scenario

**Given** Colin has no §3.2 access to Alice's Documents (`—` cell).

**When** Colin attempts to mutate Alice's Documents.

**Then** the API returns leak-free `404` — same as a nonexistent section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Documents data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/documents`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; leak-free body
