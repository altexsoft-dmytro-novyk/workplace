# ACF-AU-01 · Self reads own profile

**Trace:** §3.2 Self · AD-10 · ACF-1

**U-19 normative coverage:** No corresponding `TR-*` row exists — v1.5 §3.2 defines Self generally, but no `TR-2.1-*` or `TR-3.2-S*` row names Self as a distinct requirement subject. See `test-design-qa.md` § Normative coverage map.

**Approved:** Anna Pikula, 2026-08-30

> **Reworked — 2026-09-13 (`ACF-AU-R1`, `R-PLAT2-01`/`R-PLAT2-03`).** Since 2026-09-01, `GET /users/:id` returns `200` to any active authenticated viewer, so `200` alone no longer discriminates Self. The test now asserts `resolveAudiences(Alice, [Alice])` is exactly `{self}` as the primary oracle; the `200` below is kept only as separately labelled UM-owned route evidence.

## Scenario

**Given** Alice is an authenticated employee and the target of the request is Alice herself.

**When** Alice reads her own profile.

**Then** the read is allowed — Self is evaluated first and resolves without consulting any relationship edge, so a person always reaches their own record even with an empty org graph.

**Preconditions:** [fixture](../README.md#foundation-fixture); no extra state.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<alice-id>>" },
    "body": {}
  }
  ```
- **expectedResult:** `resolveAudiences(<alice-id>, [<alice-id>])` yields exactly `{self}`. `GET /users/<alice-id>` also returns `200`, but only as UM-owned route evidence, not as the audience oracle.
