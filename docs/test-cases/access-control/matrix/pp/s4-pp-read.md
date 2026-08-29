# AC-M-S4-PP-R · pp read s4

**Trace:** §3.2 S4 · AD-10

## Scenario

**Given** Paula is Alice's assigned people partner.

**When** Paula reads Alice's Employment section.

**Then** the request succeeds and the section data is present in the response — the §3.2 pp cell grants read.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Employment data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Paula>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `employment` present; `grade`, `position`, and `employmentStatus` present
