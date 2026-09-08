# ACM5-SA-06 · An unsupported section returns none successfully

**Trace:**

- SPEC [CAP-5](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — an unsupported section string successfully returns `none`.
- Access Control Foundation [Architecture spine — Design Paradigm](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#design-paradigm) — the public facade is the headless kernel boundary.
- Architecture spine [AD-1](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-1--foundation-boundary-adopted-amended-2026-08-30-p2) — Phase-0 is limited to its defined audience foundation.
- Architecture spine [AD-3](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-3--kernel-evidence-and-consumer-evidence-are-separate-amended-2026-08-30-p2) — the kernel subject is the public facade, never an invented HTTP endpoint.
- [access-control.md § The AccessControl facade](../../../architecture/access-control.md#the-accesscontrol-facade-ad-9) and [§ Matrix exceptions](../../../architecture/access-control.md#matrix-exceptions-33) — the facade is a base-section boundary, not a general projection evaluator.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) and [§ Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — this is Stage-1 prose for the facade gate.

## Scenario

**Given** a viewer and target form a confirmed valid Phase-0 audience pair.

**When** the caller invokes
`AccessControlFacade.canAccessSection(viewerId, 'S1', targetEmployeeId)` (or
any string other than `'profile:identity'`, `'profile:leave'`, or
`'profile:projects'`).

**Then** the promise resolves successfully to `'none'`; it does not throw and
does not attempt to derive a decision for that unsupported section. `'S1'` is
deliberately the chosen example here (PLAT-E4-S4.1b): it is the retired
pre-rename identifier, now just an arbitrary unmatched string like any other —
proof the rename left no magic-string special case behind.

**Preconditions:** identities are present and active; the string is not one of
the three CAP-5-supported section identifiers.
