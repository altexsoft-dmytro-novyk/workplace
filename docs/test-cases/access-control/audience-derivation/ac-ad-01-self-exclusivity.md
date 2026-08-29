# AC-AD-01 · Self wins over Reporting line on own profile

**Trace:** §3.2 Self · AD-10 · facade-contract.md (Self wins)

## Scenario

**Given** Alice is viewing **her own** profile and also appears in her own reporting chain in seed data.

**When** Alice reads a section where Self and Reporting line cells differ (S6 is `—` for Self but RW for Reporting line).

**Then** only the **Self** column applies — S6 must be absent (`404`), proving manager columns are not merged when `viewerId === targetEmployeeId`.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice reports to Bob.

## Test

- **inputURL:** `GET /users/<alice-id>/risks`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; `risks` key absent — Self `—` cell wins, not Reporting line RW
