# S4.1a-DP-02 · A deactivated user never receives a `DEFAULT_PERMISSIONS` key

**Trace:**

- SPEC [CAP-4](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — inactive users are denied throughout `isAllowed`.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) — Stage-1 contract before tests and code.
- SCP [`sprint-change-proposal-2026-09-04-section-access-consolidation.md` §4.3 D2](../../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md) — "every **active** user implicitly holds" the baseline; inactivity is not a carve-out, it is the boundary.
- [access-control.md § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md#functional-role-kernel-mvp-ad-4) — Kernel MVP runtime eligibility includes `User.isActive` for every path, baseline included.
- Story [`spec-4-1a-default-permissions-baseline.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-1a-default-permissions-baseline.md) — this increment's own spec.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — real module, real PostgreSQL.

## Scenario

**Given** a User exists with `isActive = false` and no `UserPolicies` row.

**When** the caller invokes
`AccessControlFacade.isAllowed(userId, 'profile:identity:write')`.

**Then** the promise resolves to `false`. The engine is allow-only and holds
no per-individual carve-out, but an inactive user is never inside the
baseline's "active user" predicate in the first place, and the fallback
data-driven grant chain independently denies with no matching attachment.

**Preconditions:** migrated PostgreSQL; real facade; the named User's
`isActive` column is `false` at evaluation time.
