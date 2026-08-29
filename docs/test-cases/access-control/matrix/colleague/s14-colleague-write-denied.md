# AC-M-S14-CO-W-DEN · colleague write s14 denied (no access)

**Trace:** §3.2 S14 · AD-10

## Scenario

**Given** Colin has no §3.2 access to Alice's Action items (`—` cell).

**When** Colin attempts to mutate Alice's Action items.

**Then** the API returns leak-free `404` — same as a nonexistent section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Action items data for Alice.

## Test

- **inputURL:** `POST /action-items`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; leak-free body
