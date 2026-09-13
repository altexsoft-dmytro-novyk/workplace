# ACF-AU-02 · Direct manager reads a report's profile

**Trace:** §2.1 relation 1 · §3.2 Reporting line · AD-10 · ACF-1

**U-19 normative coverage:** Component evidence for `TR-2.1-02` (v1.5 §2.1 — transitive reports-to Reporting line; the direct case is depth 1 of that walk). HTTP-level allow case; the production route is not yet wired to this facade (`SEC-AUTH-01` open P0). See `test-design-qa.md` § Normative coverage map.

**Approved:** Anna Pikula, 2026-08-30

> **Reworked — 2026-09-13 (`ACF-AU-R1`, `R-PLAT2-01`/`R-PLAT2-03`).** Since 2026-09-01, `GET /users/:id` returns `200` to any active authenticated viewer, so `200` alone no longer discriminates Reporting. The test now asserts `resolveAudiences(Bob, [Alice])` is exactly `{reporting}` as the primary oracle; the `200` below is kept only as separately labelled UM-owned route evidence.

## Scenario

**Given** Bob is Alice's direct unit manager through a live `Relationship type='direct'` row (Alice → Bob).

**When** Bob reads Alice's profile.

**Then** the read is allowed — a live reports-to edge resolves the Reporting line audience for the manager at the other end of it.

**Preconditions:** [fixture](../README.md#foundation-fixture); the Alice → Bob `direct` edge is live.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<bob-id>>" },
    "body": {}
  }
  ```
- **expectedResult:** `resolveAudiences(<bob-id>, [<alice-id>])` yields exactly `{reporting}`. `GET /users/<alice-id>` also returns `200`, but only as UM-owned route evidence, not as the audience oracle.
