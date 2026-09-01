# ACF-FC-02 · PP inheritance stops at the assigned People Partner

**Trace:** §2.1 · §3.2 PP · AD-19 · AD-12 · ACF-1

**Approved:** Anna Pikula, 2026-08-30

> **Expected result superseded — 2026-09-01.** The fail-closed *principle* is unchanged: PP resolution stops at the directly assigned endpoint and does not walk the PP's own manager chain. But the `403` on `GET /users/:id` no longer holds — User Management now returns the S1 identity card (`200`) to any colleague, and Hana is a colleague to Alice ([adoption SPEC](../../../../_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md)). The rework: assert `resolveAudiences(Hana, [Alice])` yields `{colleague}` and does **not** contain `pp`. That is its own AD-1 pass and needs fresh approval. Do not translate the `403` below.

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
