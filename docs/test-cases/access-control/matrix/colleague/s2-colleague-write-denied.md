# AC-M-S2-CO-W-DEN · colleague write s2 denied (no access)

**Trace:** §3.2 S2 · AD-10

## Scenario

**Given** Colin has no §3.2 access to Alice's Personal contacts (`—` cell).

**When** Colin attempts to mutate Alice's Personal contacts.

**Then** the API returns leak-free `404` — same as a nonexistent section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Personal contacts data for Alice.

## Test

- **inputURL:** `PATCH /users/<alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; leak-free body
