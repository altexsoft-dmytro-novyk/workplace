# ACF-AU-04 · Assigned People Partner reads the profile

**Trace:** §2.1 · §3.2 PP · AD-19 · ACF-1

**U-19 normative coverage:** Primary evidence for `TR-2.1-05` (v1.5 §2.1 — direct assigned-PP audience derivation). HTTP-level allow case; the production route is not yet wired to this facade (`SEC-AUTH-01` open P0). See `test-design-qa.md` § Normative coverage map.

**Approved:** Anna Pikula, 2026-08-30

> **Reworked — 2026-09-13 (`ACF-AU-R1`, `R-PLAT2-01`/`R-PLAT2-03`).** Since 2026-09-01, `GET /users/:id` returns `200` to any active authenticated viewer, so `200` alone no longer discriminates PP. The test now asserts `resolveAudiences(Paula, [Alice])` is exactly `{pp}` as the primary oracle; the `200` below is kept only as separately labelled UM-owned route evidence.

## Scenario

**Given** Paula is Alice's assigned People Partner through a `Relationship type='people_partner'` row, and Paula is nowhere in Alice's reporting chain.

**When** Paula reads Alice's profile.

**Then** the read is allowed — the PP audience derives from the assignment fact alone. It is a separate column from Reporting line, not a special case of it.

**Preconditions:** [fixture](../README.md#foundation-fixture); the Alice → Paula `people_partner` edge is live.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<paula-id>>" },
    "body": {}
  }
  ```
- **expectedResult:** `resolveAudiences(<paula-id>, [<alice-id>])` yields exactly `{pp}`. `GET /users/<alice-id>` also returns `200`, but only as UM-owned route evidence, not as the audience oracle.
