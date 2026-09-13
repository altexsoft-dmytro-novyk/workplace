# ACF-AU-03 · Manager's manager reads through the chain

**Trace:** §2.1 relation 1 · §3.2 Reporting line · AD-10 · ACF-1

**U-19 normative coverage:** Primary evidence for `TR-2.1-02` (v1.5 §2.1 — transitive reports-to Reporting line). HTTP-level allow case; the production route is not yet wired to this facade (`SEC-AUTH-01` open P0). See `test-design-qa.md` § Normative coverage map.

**Approved:** Anna Pikula, 2026-08-30

> **Reworked — 2026-09-13 (`ACF-AU-R1`, `R-PLAT2-01`/`R-PLAT2-03`).** Since 2026-09-01, `GET /users/:id` returns `200` to any active authenticated viewer, so `200` alone no longer discriminates Reporting. The test now asserts `resolveAudiences(Carol, [Alice])` is exactly `{reporting}` as the primary oracle; the `200` below is kept only as separately labelled UM-owned route evidence.

## Scenario

**Given** Alice reports to Bob and Bob reports to Carol, both through `Relationship type='direct'` rows, and Carol holds no direct edge to Alice.

**When** Carol reads Alice's profile.

**Then** the read is allowed — the Reporting walk is recursive, so every ancestor on the `direct` chain resolves the Reporting line audience. Nothing about Carol is stored on Alice; the audience is derived per request.

**Preconditions:** [fixture](../README.md#foundation-fixture); both `direct` edges live; no Alice → Carol edge exists.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<carol-id>>" },
    "body": {}
  }
  ```
- **expectedResult:** `resolveAudiences(<carol-id>, [<alice-id>])` yields exactly `{reporting}`, through the transitive walk and not through a stored pointer. `GET /users/<alice-id>` also returns `200`, but only as UM-owned route evidence, not as the audience oracle.
