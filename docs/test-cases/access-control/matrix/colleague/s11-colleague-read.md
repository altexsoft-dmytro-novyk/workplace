# AC-M-S11-CO-R · colleague read s11

**Trace:** §3.2 S11 · AD-10

## Scenario

**Given** Colin is Alice's unrelated colleague.

**When** Colin reads Alice's Projects section.

**Then** the request succeeds and the section data is present in the response — the §3.2 colleague cell grants read. Colleague projection shows project name only (§3.3.4).

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Projects data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `projects` present; each project includes `name`; `role`, `allocation`, `startDate`, and `endDate` **absent** on every item
