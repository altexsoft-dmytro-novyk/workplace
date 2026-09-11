# ACM2-IA-01 · A live active FR grant for the exact permission key allows

**Trace:**

- SPEC [CAP-4](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — the current global functional-permission decision reads live `type='FR'` data.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) — this is Stage-1 scenario prose; the public facade call is the scoped headless-gate subject.
- Architecture spine [AD-4](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — authorization joins active `User`, `UserPolicies`, FR `Policies`, `PolicyPermissions`, and `Permissions.key`.
- FR-AMD-1 [OQ-11 — Evaluator and Seed Ownership](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — the facade delegates to the one data-driven `isAllowed` evaluator.
- [access-control.md § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md#functional-role-kernel-mvp-ad-4) — the evaluator joins the active user, attachment, FR policy, grant, and canonical key.
- [database-schema.md §§ Permissions, PolicyPermissions, UserPolicies](../../../architecture/database-schema.md#permissions) — canonical key, FR grant join, and attachment join.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — real module, Prisma adapters, migrated PostgreSQL, and no invented HTTP endpoint.
- **U-19 normative coverage:** Mechanism-level evidence for `TR-2.1-01` (v1.5 §2.1 — functional-role evaluation underlying "roles remain separate") — headless-facade proof, not API E2E. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** an active User is attached through `UserPolicies` to the seeded
`type='FR'` `hr-admin` policy, and that policy is joined through
`PolicyPermissions` to the seeded `Permissions` row whose exact `key` is
`'user-management:create'`.

**When** the caller invokes
`AccessControlFacade.isAllowed(userId, 'user-management:create')`.

**Then** the promise resolves to `true`. The decision comes from the live
five-table FR join; it is not inferred from `targetRole`, a user position, an
audience, or a hard-coded permission name.

**Preconditions:** completed ACM-1 schema/bootstrap; migrated PostgreSQL; real
`AccessControlModule`; the named User remains active at evaluation time.
