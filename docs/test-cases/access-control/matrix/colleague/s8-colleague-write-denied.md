# AC-M-S8-CO-W-DEN · colleague write s8 denied (no access)

**Trace:** §3.2 S8 · AD-10

## Scenario

**Given** Colin has no §3.2 access to Alice's Feedbacks (`—` cell).

**When** Colin attempts to mutate Alice's Feedbacks.

**Then** the API returns leak-free `404` — same as a nonexistent section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Feedbacks data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/feedbacks`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; leak-free body
