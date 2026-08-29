# AC-M-S7-CO-W-DEN · colleague write s7 denied (no access)

**Trace:** §3.2 S7 · AD-10

## Scenario

**Given** Colin has no §3.2 access to Alice's Management notes (`—` cell).

**When** Colin attempts to mutate Alice's Management notes.

**Then** the API returns leak-free `404` — same as a nonexistent section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Management notes data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/notes`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; leak-free body
