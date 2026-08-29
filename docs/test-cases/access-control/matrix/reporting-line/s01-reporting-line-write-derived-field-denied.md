# AC-M-S01-RL-W-DER · Reporting line cannot PATCH derived S1 fields

**Trace:** §3.2 fn 1 · AD-10

## Scenario

**Given** Bob has Reporting line RW on S1 for stored identity fields.

**When** Bob PATCHes Alice's **manager** field through the identity endpoint.

**Then** the mutation is rejected — manager/PP/mentor/projects are derived read-only on S1; org changes use relationship commands.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice reports to Bob.

## Test

- **inputURL:** `PATCH /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": { "managerId": "<other-manager-id>" }
  }
  ```
- **expectedResult:** `403` or `400`; manager field unchanged — derived field immutability
