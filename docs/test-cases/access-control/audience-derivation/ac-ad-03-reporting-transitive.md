# AC-AD-03 · Transitive Reporting line

**Trace:** §2.1 · AD-10 · facade-contract.md (Reporting transitivity)

## Scenario

**Given** Alice reports to Bob and Bob reports to Carol, both via `direct` edges.

**When** Carol reads Alice's employment section.

**Then** Carol resolves **Reporting line** for Alice through transitive `direct` recursion.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice → Bob → Carol chain.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Carol>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; employment section present
