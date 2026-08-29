# AC-M-S11-RE-R · reporting-line read s11

**Trace:** §3.2 S11 · AD-10

## Scenario

**Given** Bob is Alice's Reporting line (direct unit manager).

**When** Bob reads Alice's Projects section.

**Then** the request succeeds and the section data is present in the response — the §3.2 reporting line cell grants read. Colleague projection shows project name only (§3.3.4).

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Projects data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `projects` present; at least one project with `name`
