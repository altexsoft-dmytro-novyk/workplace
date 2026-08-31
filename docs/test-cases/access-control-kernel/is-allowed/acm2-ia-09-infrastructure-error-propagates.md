# ACM2-IA-09 · An evaluation infrastructure error rejects instead of denying silently

**Trace:**

- SPEC [CAP-4](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — the decision is a live data evaluation.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) — this Stage-1 contract must be independently approved before tests.
- Architecture spine [AD-4](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — infrastructure failures reject without an authorization result.
- FR-AMD-1 [OQ-11 — Evaluator and Seed Ownership](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — the facade delegates evaluation rather than manufacturing a fallback result.
- [access-control.md § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md#functional-role-kernel-mvp-ad-4) — live evaluator architecture.
- [database-schema.md §§ Permissions, PolicyPermissions, UserPolicies](../../../architecture/database-schema.md#permissions) — the real persisted joins whose unreadability causes the evaluation failure.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — no repository fake; use a genuine PostgreSQL connection/query failure.

## Scenario

**Given** an active User has a valid exact FR grant and the same
`isAllowed(userId, 'user-management:create')` call resolves to `true` while
the database is healthy. The evaluation's database connection or query is then
made to fail.

**When** the caller repeats the same facade call while that infrastructure
failure holds.

**Then** the promise rejects with the propagated infrastructure error. It does
not resolve to `false` or to any other authorization result: an unavailable
decision is distinct from a determined denial.

**Preconditions:** migrated PostgreSQL; real facade and Prisma adapter; the
failure is induced at the real database boundary and restored after the call.
