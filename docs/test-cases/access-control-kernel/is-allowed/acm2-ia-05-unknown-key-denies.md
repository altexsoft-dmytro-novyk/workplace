# ACM2-IA-05 · An unknown permission key is denied

**Trace:**

- SPEC [CAP-4](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — unknown keys return `false`.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) — approved scenario prose is required first.
- Architecture spine [AD-4](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — the public key is open, not a closed MVP union; unknown data denies.
- FR-AMD-1 [OQ-7 — Canonical Feature Identifier](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — unknown key returns `false`; the evaluator branches on no key.
- [access-control.md § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md#functional-role-kernel-mvp-ad-4) — the canonical `Permissions.key` participates in the join.
- [database-schema.md §§ Permissions, PolicyPermissions, UserPolicies](../../../architecture/database-schema.md#permissions) — catalog key identity and the joining tables.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — real facade and real PostgreSQL.
- **U-19 normative coverage:** Mechanism-level evidence for `TR-2.1-01` (v1.5 §2.1 — functional-role evaluation underlying "roles remain separate") — headless-facade proof, not API E2E. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** an active User has a valid FR attachment and grant, but no
`Permissions` catalog row has `key='user-management:archive'`.

**When** the caller invokes
`AccessControlFacade.isAllowed(userId, 'user-management:archive')`.

**Then** the promise resolves to `false`. The evaluator treats the supplied
string as data and does not grant because the User holds some other permission
or because the key resembles the seeded naming convention.

**Preconditions:** migrated PostgreSQL; real facade; the active User's valid
grant is present as a control, and the supplied key is verified absent from the
catalog.
