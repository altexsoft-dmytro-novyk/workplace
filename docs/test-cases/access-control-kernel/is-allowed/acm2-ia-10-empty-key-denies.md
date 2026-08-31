# ACM2-IA-10 · An empty permission key is denied without inventing a short-circuit contract

**Trace:**

- SPEC [CAP-4](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — the evaluator branches on no role/key name and unknown keys deny.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) — this Stage-1 prose is the approved script for later evidence.
- Architecture spine [AD-4](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — the public input is an open case-sensitive string and authorization is data-driven.
- FR-AMD-1 [OQ-7 — Canonical Feature Identifier](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/fr-architecture-amendment.md) — the evaluator branches on no key and unknown keys return `false`.
- [access-control.md § Functional-role Kernel MVP (AD-4)](../../../architecture/access-control.md#functional-role-kernel-mvp-ad-4) — canonical key join; no role/key-name branching.
- [database-schema.md §§ Permissions, PolicyPermissions, UserPolicies](../../../architecture/database-schema.md#permissions) — no catalog `Permissions.key` is the empty string, and the key is the join input.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — evidence calls the public facade.

## Scenario

**Given** an active User has a valid FR attachment and at least one live grant,
but no `Permissions` row has `key=''`.

**When** the caller invokes `AccessControlFacade.isAllowed(userId, '')`.

**Then** the promise resolves to `false`. CAP-4 and FR-AMD-1 require a
data-driven evaluator that branches on no key name; neither source states that
an empty string must short-circuit before a database round-trip. This scenario
therefore asserts the denial only and intentionally makes no assertion about
whether evaluation performs a query.

**Preconditions:** migrated PostgreSQL; real facade; `''` is confirmed absent
from `Permissions` before the call.
