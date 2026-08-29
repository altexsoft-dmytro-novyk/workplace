# AC-AD-10 · Department policy withheld in Phase 1

**Trace:** AD-10 · facade-contract.md (Department policy)

## Scenario

**Given** Eve holds a `targetType:'department'` management policy but Phase 1 does not walk department edges.

**When** Eve requests Alice's employment.

**Then** the department policy contributes **no audience** until the Department contract is approved.

**Preconditions:** [fixture](../README.md#canonical-personas); Eve has department policy row; no reports-to/PP relation to Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Eve>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; employment absent — department walk withheld
