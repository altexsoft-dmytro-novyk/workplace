# AC-AD-04 · Directly assigned PP only (Phase 1)

**Trace:** §2.1 · AD-19 · facade-contract.md Phase 1

## Scenario

**Given** Paula is Alice's assigned people partner via `Relationship type='people_partner'`.

**When** Paula reads Alice's personal contacts (PP RW cell).

**Then** access succeeds through the **PP** audience — Phase 1 resolves only the direct PP endpoint.

**Preconditions:** [fixture](../README.md#canonical-personas); Paula assigned PP for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Paula>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; personal-contacts section present
