# ACM5-SA-01 · `profile:identity` grants read to Self or Colleague alone

**Trace:**

- SPEC [CAP-5](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — `profile:identity` is `read` for Self or Colleague where no stronger Phase-0 audience applies.
- Access Control Foundation [Architecture spine — Design Paradigm](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#design-paradigm) — the public facade is the headless kernel boundary.
- Architecture spine [AD-1](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-1--foundation-boundary-adopted-amended-2026-08-30-p2) — Phase-0 supplies only Self, direct Reporting, direct PP, and Colleague.
- Architecture spine [AD-3](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-3--kernel-evidence-and-consumer-evidence-are-separate-amended-2026-08-30-p2) — the kernel subject is the public facade, never an invented HTTP endpoint.
- [access-control.md § The AccessControl facade](../../../architecture/access-control.md#the-accesscontrol-facade-ad-9) and [§ Matrix exceptions](../../../architecture/access-control.md#matrix-exceptions-33) — `canAccessSection` returns the base decision and `profile:identity` has the documented matrix/derived-field limits.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) and [§ Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — this is Stage-1 prose for the facade gate.

## Scenario

**Given** Phase-0 audience resolution has already confirmed an active
viewer/target pair and returns exactly `Set {'self'}` for one call, and a
separate confirmed active unrelated pair returns exactly `Set {'colleague'}`;
neither set contains `reporting` or `pp`.

**When** the caller invokes
`AccessControlFacade.canAccessSection(viewerId, 'profile:identity', targetEmployeeId)` for
each pair.

**Then** each promise resolves to `'read'`. The facade converts the already
resolved audience set into the `profile:identity` base decision; it does not inspect policy
tables, project facts, department facts, or any owning-context projection
rule.

**Preconditions:** `resolveAudiences` is the already-approved, unchanged
Phase-0 resolver; all named identities are present and active; no Reporting or
direct-PP relationship exists for either pair.
