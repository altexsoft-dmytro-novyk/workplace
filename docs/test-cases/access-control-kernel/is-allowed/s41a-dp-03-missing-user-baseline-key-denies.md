# S4.1a-DP-03 · A nonexistent user id denies the baseline key without becoming an application error

**Trace:**

- SPEC [CAP-4](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — missing users return `false`, never throw.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) — Stage-1 contract before tests and code.
- SCP [`sprint-change-proposal-2026-09-04-section-access-consolidation.md` §4.3 D2](../../../../_bmad-output/planning-artifacts/sprint-change-proposal-2026-09-04-section-access-consolidation.md) — the baseline check adds one point lookup keyed by `userId`; a miss must resolve like any other ineligible user, not surface as infrastructure failure.
- [access-control.md § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md#functional-role-kernel-mvp-ad-4) — the active-User join is a required member on every eligibility path; absent data denies.
- Story [`spec-4-1a-default-permissions-baseline.md`](../../../../_bmad-output/implementation-artifacts/platform/spec-4-1a-default-permissions-baseline.md) — this increment's own spec.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — real module, real PostgreSQL.

## Scenario

**Given** a well-formed `userId` is asserted to match no `User` row at all.

**When** the caller invokes
`AccessControlFacade.isAllowed(userId, 'profile:identity:write')`.

**Then** the promise resolves to `false`. The point lookup backing the
baseline check finds no row and is treated as "not an active user," not as an
error; the fallback grant-chain path also denies with no matching User to
join through.

**Preconditions:** migrated PostgreSQL; real facade; the asserted `userId` is
a syntactically valid id (matching the column type) that matches zero rows in
`users`.
