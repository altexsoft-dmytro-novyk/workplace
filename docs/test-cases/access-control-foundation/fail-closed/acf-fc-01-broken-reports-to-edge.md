# ACF-FC-01 · Walk stops at a broken reports-to edge

**Trace:** §3.2 Reporting line · AD-11 · AD-12 · ACF-1

**U-19 normative coverage:** Weak fail-closed-edge evidence for `TR-2.1-02` (v1.5 §2.1 — transitive Reporting line). Reworked 2026-09-11 to the resolver audience-set assertion. See `test-design-qa.md` § Normative coverage map.

**Approved:** Anna Pikula, 2026-08-30 (original scenario, HTTP `403` expectation — superseded, see below)
**Reworked & approved:** Anna Pikula, 2026-09-11 — retro-anchor. The resolver behavior and its test (`services/backend` commit `da7d1fa`, 2026-09-03) predate this approval; this is the fresh AD-1 pass the 2026-09-01 note said was still needed, approving the rewrite below rather than a scenario-first change.

> **Expected result reworked — 2026-09-11 (superseded 2026-09-01).** The fail-closed *principle* here is unchanged and still load-bearing: a deactivated intermediate manager must not bridge reach to their ancestors. But observing it as a `403` on `GET /users/:id` no longer holds, because User Management now returns the S1 identity card (`200`) to any colleague, and Frank *is* a colleague to Erin ([adoption SPEC](../../../../_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md)). This file now asserts `resolveAudiences(Frank, [Erin])` yields `{colleague}` and does **not** contain `reporting` — the broken edge did not promote him.

## Scenario

**Given** Erin reports to InactiveMgr through a `direct` row, InactiveMgr is deactivated (`isActive = false`), and Frank is InactiveMgr's own manager through a live `direct` row.

**When** the facade resolves Frank's audiences for Erin.

**Then** the resolved set is `{colleague}` and does not contain `reporting` — a broken node is treated as no edge, so the recursive walk terminates there instead of continuing through it. Frank has no relationship of his own to Erin, so he falls back to Colleague. Fail-closed means missing or damaged data yields *less* access, never more: a deactivated intermediate manager must not become a bridge that hands their ancestors reach they never had.

**Preconditions:** [fixture](../README.md#foundation-fixture); InactiveMgr is seeded with `isActive = false`; both `direct` edges exist as rows.

## Test

> **Facade-level case.** Asserted at the facade, not over HTTP — `GET /users/:id` now returns `200` for every audience in `{self, reporting, pp, colleague}`, so an HTTP status can no longer discriminate which audience resolved. The deviation from the `inputURL` skeleton in [../../README.md](../../README.md) is deliberate, matching `ACF-FC-03`.

- **facadeCall:** `accessControl.resolveAudiences(<frank-id>, [<erin-id>])`
- **expectedResult:** the audience set for `<erin-id>` is exactly `{colleague}` — `reporting` is absent. The presence of an unbroken row from InactiveMgr to Frank must not produce a `reporting` grant.
