# ACM2-IA-02 · Removing a live grant revokes the next decision immediately

**Trace:**

- SPEC [CAP-4](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — evaluation reads live FR data and persists or caches no decision.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) — Stage-1 contract before any Stage-2 evidence.
- Architecture spine [AD-4](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — the decision is a live join over the functional-role tables.
- FR-AMD-1 [OQ-11 — Evaluator and Seed Ownership](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — one delegated FR evaluator owns the decision.
- [access-control.md § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md#functional-role-kernel-mvp-ad-4) — `isAllowed` is live and data-driven.
- [database-schema.md §§ Permissions, PolicyPermissions, UserPolicies](../../../architecture/database-schema.md#permissions) — the permission/grant/attachment rows that make the join reachable.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — evaluate through the public facade against real PostgreSQL.
- **U-19 normative coverage:** Mechanism-level evidence for `TR-2.1-01` and `TR-2.3-02` (v1.5 §2.3 — removal immediate half only; "independently grantable via UI" half has no scenario) — headless-facade proof, not API E2E. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** an active User has the live FR grant from ACM2-IA-01, and a first
`isAllowed(userId, 'user-management:create')` call has resolved to `true`.

**When** either (a) that User's `UserPolicies` attachment is deleted, or (b)
the attached FR `Policies` row is deleted along with its dependent reachable
join facts, and the same facade call is made again after the committed removal.

**Then** the second promise resolves to `false`. It must not replay the first
positive result: CAP-4 allows no decision cache or persistence, so the next
call observes the current absence of a reachable FR join.

**Preconditions:** each alternative runs from its own valid migrated fixture;
the removal is performed through a supported fixture arrangement that respects
the restrictive foreign-key contract, not by creating an orphaned grant row.
