# AC-M-S13-CO-W-DEN · colleague write s13 denied (no access)

**Trace:** §3.2 S13 · AD-10

## Scenario

**Given** Colin has no §3.2 access to Alice's Mentorship (`—` cell).

**When** Colin attempts to mutate Alice's Mentorship.

**Then** the API returns leak-free `404` — same as a nonexistent section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Mentorship data for Alice.

## Test

- **inputURL:** `POST /mentorship-pairs`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; leak-free body
