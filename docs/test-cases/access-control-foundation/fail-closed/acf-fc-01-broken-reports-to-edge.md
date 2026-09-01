# ACF-FC-01 · Walk stops at a broken reports-to edge

**Trace:** §3.2 Reporting line · AD-11 · AD-12 · ACF-1

**Approved:** Anna Pikula, 2026-08-30

> **Expected result superseded — 2026-09-01.** The fail-closed *principle* here is unchanged and still load-bearing: a deactivated intermediate manager must not bridge reach to their ancestors. But the way this file observes it — a `403` on `GET /users/:id` — no longer holds, because User Management now returns the S1 identity card (`200`) to any colleague, and Frank *is* a colleague to Erin ([adoption SPEC](../../../../_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md)). The rework: assert `resolveAudiences(Frank, [Erin])` yields `{colleague}` and does **not** contain `reporting` — the broken edge did not promote him. That is its own AD-1 pass and needs fresh approval. Do not translate the `403` below.

## Scenario

**Given** Erin reports to InactiveMgr through a `direct` row, InactiveMgr is deactivated (`isActive = false`), and Frank is InactiveMgr's own manager through a live `direct` row.

**When** Frank reads Erin's profile.

**Then** the read is denied — a broken node is treated as no edge, so the recursive walk terminates there instead of continuing through it. Frank has no relationship of his own to Erin, so he falls back to Colleague. Fail-closed means missing or damaged data yields *less* access, never more: a deactivated intermediate manager must not become a bridge that hands their ancestors reach they never had.

**Preconditions:** [fixture](../README.md#foundation-fixture); InactiveMgr is seeded with `isActive = false`; both `direct` edges exist as rows.

## Test

- **inputURL:** `GET /users/<erin-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<frank-id>>" },
    "body": {}
  }
  ```
- **expectedResult:** `403`; no profile fields are returned. The presence of an unbroken row from InactiveMgr to Frank must not produce a grant.
