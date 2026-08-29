# AC-AD-07 · No cross-kind inheritance into Project line

**Trace:** §2.1 · facade-contract.md (No cross-kind inheritance)

## Scenario

**Given** Frank manages Dave by **reports-to**, and Dave is DM on Alice's project, but Frank holds **no** project-management policy for that project.

**When** Frank requests Alice's risks (Reporting line RW would apply only via reports-to path to Dave, not project members).

**Then** Frank does **not** inherit Project-line reach into Alice's project; without Reporting line to Alice, access is denied.

**Preconditions:** [fixture](../README.md#canonical-personas); Frank → Dave reports-to; Dave DM on Alice's project; Frank not on project.

## Test

- **inputURL:** `GET /users/<alice-id>/risks`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Frank>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; risks absent — no Reporting line to Alice, no Project line in Phase 1
