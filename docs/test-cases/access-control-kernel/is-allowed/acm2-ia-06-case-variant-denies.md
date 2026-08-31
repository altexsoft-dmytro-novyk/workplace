# ACM2-IA-06 · A differently cased permission key is denied

**Trace:**

- SPEC [CAP-4](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — differently-cased keys return `false`.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) — Stage-1 scenario prose.
- Architecture spine [AD-4](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — permission keys are open, case-sensitive strings.
- FR-AMD-1 [OQ-7 — Canonical Feature Identifier](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — differently-cased keys return `false`.
- [access-control.md § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md#functional-role-kernel-mvp-ad-4) — unknown or differently-cased key data denies.
- [database-schema.md §§ Permissions, PolicyPermissions, UserPolicies](../../../architecture/database-schema.md#permissions) — `Permissions.key` is the canonical, case-sensitive input.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — public-facade PostgreSQL evidence.

## Scenario

**Given** an active User has a live FR grant for the catalog key
`'user-management:create'`.

**When** the caller invokes
`AccessControlFacade.isAllowed(userId, 'User-Management:Create')`.

**Then** the promise resolves to `false`. Case folding, normalization, and
case-insensitive comparison are forbidden: the input is not the exact stored
key even though its characters otherwise spell the granted permission.

**Preconditions:** migrated PostgreSQL; real facade; a healthy control call
with the exact lowercase key resolves to `true`.
