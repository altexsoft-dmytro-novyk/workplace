# AC-M-S9-CO-W-DEN · colleague write s9 denied (no access)

**Trace:** §3.2 S9 · AD-10

## Scenario

**Given** Colin has no §3.2 access to Alice's Career timeline (`—` cell).

**When** Colin attempts to mutate Alice's Career timeline.

**Then** the API returns leak-free `404` — same as a nonexistent section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Career timeline data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/events`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; leak-free body
