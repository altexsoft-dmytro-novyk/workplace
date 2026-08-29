# ACF-FC-02 · PP inheritance stops at the assigned People Partner

**Trace:** §2.1 · §3.2 PP · AD-19 · AD-12 · ACF-1

## Scenario

**Given** Paula is Alice's assigned People Partner and Paula herself reports to Hana through a live `direct` row, while Hana holds no relationship of her own to Alice.

**When** Hana reads Alice's profile.

**Then** the read is denied — the PP branch resolves only the directly assigned endpoint. Propagation to the PP's own manager chain requires the approved Department contract to define where the HR boundary is; until then, walking an unrestricted reports-to chain and calling it "inside HR" is exactly the fail-open mistake AD-19 forbids. Hana falls back to Colleague.

**Preconditions:** [fixture](../README.md#foundation-fixture); Alice → Paula `people_partner` and Paula → Hana `direct` edges are both live; no edge connects Hana and Alice.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<hana-id>>" },
    "body": {}
  }
  ```
- **expectedResult:** `403`; no profile fields are returned. Reaching Alice through Paula's manager chain is a leak, not an inheritance.
