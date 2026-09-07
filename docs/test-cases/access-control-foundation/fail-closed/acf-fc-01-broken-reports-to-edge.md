# ACF-FC-01 · Walk stops at a broken reports-to edge

**Trace:** §3.2 Reporting line · AD-11 · AD-12 · ACF-1

**Approved:** Anna Pikula, 2026-08-30 · **Reworked:** 2026-09-07 (`1-3a`), resolver oracle unchanged

> **Supersession history.** Authored 2026-08-30 as a `403` on `GET /users/:id`. The fail-closed
> *principle* is unchanged and still load-bearing: a deactivated intermediate manager must not
> bridge reach to their ancestors. But the 2026-09-01 User Management contract returns the S1
> identity card (`200`) to any colleague, and Frank *is* a colleague to Erin
> ([adoption SPEC](../../../../_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md)),
> so HTTP status stopped being the resolver oracle. The scenario now asserts the resolver
> audience set directly. The E2E rework shipped in `services/backend` `da7d1fa`
> (`test/access-control/audience-resolution.e2e-spec.ts`); this doc is brought in line with it.
> The resolver behaviour never changed. The 2026-08-30 / 2026-09-01 approval records are
> preserved above.

## Scenario

**Given** Erin reports to InactiveMgr through a `direct` row, InactiveMgr is deactivated (`isActive = false`), and Frank is InactiveMgr's own manager through a live `direct` row.

**When** Frank's audience over Erin is resolved.

**Then** the resolver returns exactly `{colleague}` — a broken node is treated as no edge, so the recursive walk terminates there instead of continuing through it. Frank has no relationship of his own to Erin, so he falls back to Colleague and the set does **not** contain `reporting`. Fail-closed means missing or damaged data yields *less* access, never more: a deactivated intermediate manager must not become a bridge that hands their ancestors reach they never had.

**Preconditions:** [fixture](../README.md#foundation-fixture); InactiveMgr is seeded with `isActive = false`; both `direct` edges exist as rows.

## Test

- **subject:** `AccessControlFacade.resolveAudiences(<frank-id>, [<erin-id>])`
- **expectedResult:** the audience set for `<erin-id>` is exactly `['colleague']` and does **not** contain `reporting` — the unbroken row from InactiveMgr to Frank must not produce a grant. Asserted with `expectAudienceLabels` (`test/access-control/audience-resolution.e2e-spec.ts`, `ACF-FC-01` block).
