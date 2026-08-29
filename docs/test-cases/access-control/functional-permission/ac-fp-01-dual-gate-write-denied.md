# AC-FP-01 · Dual gate — matrix write without feature permission

**Trace:** §2.2 · facade-contract.md (Dual gate)

## Scenario

**Given** Bob has Reporting line **write** on Alice's employment but lacks the feature permission required for the mutation command.

**When** Bob PATCHes employment.

**Then** mutation is denied with `403` even though the matrix cell is RW — both dimensions must permit writes.

**Preconditions:** [fixture](../README.md#canonical-personas); Bob's FR attachment excludes the employment-edit permission (seed variant).

## Test

- **inputURL:** `PATCH /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": { "grade": "L5" }
  }
  ```
- **expectedResult:** `403`; no persisted change — dual gate
