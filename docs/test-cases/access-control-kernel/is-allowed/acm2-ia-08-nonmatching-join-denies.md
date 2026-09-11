# ACM2-IA-08 · An existing permission with no matching attached FR grant is denied

**Trace:**

- SPEC [CAP-4](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — nonmatching joins return `false`.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) — scenario approval precedes Stage 2.
- Architecture spine [AD-4](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — the authorization join is by active User, attachment, FR policy, grant, and key.
- FR-AMD-1 [OQ-3 — Role-to-Permission Storage](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — grants are normalized policy-to-permission pairs.
- [access-control.md § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md#functional-role-kernel-mvp-ad-4) — evaluator joins rather than branches on a role or permission name.
- [database-schema.md §§ Permissions, PolicyPermissions, UserPolicies](../../../architecture/database-schema.md#permissions) — permission catalog, policy-grant, and user-policy attachment joins.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — real module and migrated PostgreSQL.
- **U-19 normative coverage:** Mechanism-level evidence for `TR-2.1-01` (v1.5 §2.1 — functional-role evaluation underlying "roles remain separate") — headless-facade proof, not API E2E. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** `'user-management:list'` exists in `Permissions` and is granted to
the seeded FR `hr-admin` policy, but an active User is attached only to a
different valid FR policy that has no `PolicyPermissions` row for that
permission. The User has no attachment to `hr-admin`.

**When** the caller invokes
`AccessControlFacade.isAllowed(userId, 'user-management:list')`.

**Then** the promise resolves to `false`. A permission row and some grant in
the database are insufficient; the requested permission must be linked through
an FR policy actually attached to this User.

**Preconditions:** migrated PostgreSQL; real facade; all rows are referentially
valid—this scenario is a reachable nonmatching join, not an orphaned-data
case.
