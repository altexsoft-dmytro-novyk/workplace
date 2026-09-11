# ACM2-IA-03 · An inactive user with a valid FR grant is denied

**Trace:**

- SPEC [CAP-4](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — inactive users return `false`.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) — Stage-1 scenario contract.
- Architecture spine [AD-4](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — `User.isActive` is part of the authorization join.
- FR-AMD-1 [OQ-11 — Evaluator and Seed Ownership](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — the facade delegates to the FR evaluator.
- [access-control.md § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md#functional-role-kernel-mvp-ad-4) — Kernel MVP runtime eligibility includes `User.isActive`.
- [database-schema.md §§ Permissions, PolicyPermissions, UserPolicies](../../../architecture/database-schema.md#permissions) — a valid permission/grant/attachment path exists independently of user eligibility.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — use the public facade with real PostgreSQL facts.
- **U-19 normative coverage:** Mechanism-level evidence for `TR-2.1-01` (v1.5 §2.1 — functional-role evaluation underlying "roles remain separate") — headless-facade proof, not API E2E. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** a User has the otherwise-valid exact FR attachment, grant, and
`Permissions.key='user-management:list'` path, but `User.isActive=false` at
the time of evaluation.

**When** the caller invokes
`AccessControlFacade.isAllowed(userId, 'user-management:list')`.

**Then** the promise resolves to `false`. The existing grant does not bypass
the active-user eligibility predicate.

**Preconditions:** migrated PostgreSQL; real facade; all joined FR rows are
present and valid except for the User's inactive lifecycle state.
