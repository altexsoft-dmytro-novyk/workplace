# ACM2-IA-04 · A nonexistent user id denies without becoming an application error

**Trace:**

- SPEC [CAP-4](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — missing users return `false`.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) — Stage-1 contract precedes tests and code.
- Architecture spine [AD-4](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — the active User is a required join member and missing data denies.
- FR-AMD-1 [OQ-11 — Evaluator and Seed Ownership](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — delegated evaluator ownership.
- [access-control.md § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md#functional-role-kernel-mvp-ad-4) — the evaluator starts from the active user join.
- [database-schema.md §§ Permissions, PolicyPermissions, UserPolicies](../../../architecture/database-schema.md#permissions) — attachments have a User foreign key; an id absent from User cannot form the join.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — direct public-facade evidence.

## Scenario

**Given** a well-formed `userId` is asserted to match no User row, while the
seeded `Permissions` row for `'user-management:list'` exists.

**When** the caller invokes
`AccessControlFacade.isAllowed(missingUserId, 'user-management:list')`.

**Then** the promise resolves to `false`; it does not reject merely because the
requested identity is absent.

**Preconditions:** migrated PostgreSQL; real facade; the missing id is checked
not to match a User before the call.
