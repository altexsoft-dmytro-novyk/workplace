# ACM5-SA-02 · `profile:identity` grants write to Reporting or direct PP

**Trace:**

- SPEC [CAP-5](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — `profile:identity` is `write` for Reporting or direct PP.
- Access Control Foundation [Architecture spine — Design Paradigm](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#design-paradigm) — the public facade is the headless kernel boundary.
- Architecture spine [AD-1](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-1--foundation-boundary-adopted-amended-2026-08-30-p2) — direct Reporting and direct PP are distinct Phase-0 inputs.
- Architecture spine [AD-3](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-3--kernel-evidence-and-consumer-evidence-are-separate-amended-2026-08-30-p2) — the kernel subject is the public facade, never an invented HTTP endpoint.
- [access-control.md § The AccessControl facade](../../../architecture/access-control.md#the-accesscontrol-facade-ad-9) and [§ Matrix exceptions](../../../architecture/access-control.md#matrix-exceptions-33) — base section access is distinct from downstream mutation and field rules.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) and [§ Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — this is Stage-1 prose for the facade gate.

## Scenario

**Given** Phase-0 has already resolved exactly `Set {'reporting'}` for one
confirmed active viewer/target pair and exactly `Set {'pp'}` for another; no
additional audience changes either set.

**When** the caller invokes
`AccessControlFacade.canAccessSection(viewerId, 'profile:identity', targetEmployeeId)` for
each pair.

**Then** each promise resolves to `'write'`. This is only the `profile:identity`
base section decision; a consumer still applies its own mutation prerequisites and any
applicable matrix exception.

**Preconditions:** `resolveAudiences` is unchanged; the Reporting and direct
PP facts are already valid Phase-0 facts; all named identities are present and
active.
