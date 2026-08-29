# AC-AD-11 · PP HR-line withheld in Phase 1

**Trace:** AD-19 · facade-contract.md (PP HR line withheld)

## Scenario

**Given** Paula is Alice's assigned PP and reports to Hana, but Phase 1 does **not** propagate PP audience up the HR line.

**When** Hana requests Alice's personal contacts (PP RW cell).

**Then** Hana receives **no** inherited PP grant — only Paula resolves PP in Phase 1.

**Preconditions:** [fixture](../README.md#canonical-personas); Paula PP for Alice; Paula → Hana direct edge.

## Test

- **inputURL:** `GET /users/<alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Hana>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; section absent — PP HR-line withheld
