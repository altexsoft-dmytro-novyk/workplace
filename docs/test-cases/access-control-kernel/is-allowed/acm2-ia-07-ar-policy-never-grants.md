# ACM2-IA-07 · An attached AR cross-type collision never grants a functional permission

**Trace:**

- SPEC [CAP-4](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — evaluation reads only `type='FR'` data and denies wrong-type policies.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) — this is only Stage-1 scenario prose.
- Architecture spine [AD-4](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — partial FR key uniqueness, FR-only evaluation, and the AR cross-type-collision rule.
- FR-AMD-1 [OQ-3 — Role-to-Permission Storage](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — FR-only `PolicyPermissions` discriminator and composite foreign key.
- [access-control.md § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md#functional-role-kernel-mvp-ad-4) — only FR policies participate in the evaluator join.
- [database-schema.md §§ Policies, Permissions, PolicyPermissions, UserPolicies](../../../architecture/database-schema.md#policies) — partial `targetRole` uniqueness, AR row shape, impossible AR grant, and attachment join.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — evaluate the public facade against migrated PostgreSQL.
- **U-19 normative coverage:** Mechanism-level evidence for `TR-2.1-01` (v1.5 §2.1 — roles remain separate; AR/FR type separation specifically) — headless-facade proof, not API E2E. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** an active User is attached only to a legal `type='AR'` policy whose
`targetRole='hr-admin'` collides with the seeded FR role key, and whose required
AR `targetType` and `targetId` are populated. The exact canonical permission
`'user-management:create'` exists and is granted to the separate FR
`hr-admin` policy, not to this AR row. This is the realistic supported
cross-type collision: the partial unique index permits the AR row, while the
`PolicyPermissions` `policyType='FR'` check and composite foreign key make an
AR grant physically impossible.

**When** the caller invokes
`AccessControlFacade.isAllowed(arAttachedUserId, 'user-management:create')`.

**Then** the promise resolves to `false`. The attached AR row neither leaks the
same `targetRole` nor inherits the separate FR policy's permission; evaluation
filters `Policies.type='FR'` and joins by ids, never by role-key text.

**Preconditions:** migrated PostgreSQL; real facade; the AR policy is a valid
row and is attached through `UserPolicies`; no FR policy is attached to that
User.
