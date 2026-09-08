# ACM5-SA-03 · `profile:leave` grants read to every Phase-0 audience

**Trace:**

- SPEC [CAP-5](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — `profile:leave` is `read` for every Phase-0 audience, never `write` or `none` for a confirmed valid audience.
- Access Control Foundation [Architecture spine — Design Paradigm](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#design-paradigm) — the public facade is the headless kernel boundary.
- Architecture spine [AD-1](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-1--foundation-boundary-adopted-amended-2026-08-30-p2) — Self, Reporting, direct PP, and Colleague are the Phase-0 audience vocabulary.
- Architecture spine [AD-3](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-3--kernel-evidence-and-consumer-evidence-are-separate-amended-2026-08-30-p2) — the kernel subject is the public facade, never an invented HTTP endpoint.
- [access-control.md § The AccessControl facade](../../../architecture/access-control.md#the-accesscontrol-facade-ad-9) and [§ Matrix exceptions](../../../architecture/access-control.md#matrix-exceptions-33) — the facade returns a base decision; `profile:leave`'s colleague field subset is a downstream narrowing rule.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) and [§ Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — this is Stage-1 prose for the facade gate.

## Scenario

**Given** four separate confirmed valid calls to the unchanged Phase-0 resolver
produce, respectively, `Set {'self'}`, `Set {'colleague'}`,
`Set {'reporting'}`, and `Set {'pp'}` for active viewer/target pairs.

**When** the caller invokes
`AccessControlFacade.canAccessSection(viewerId, 'profile:leave', targetEmployeeId)` for
each pair.

**Then** every promise resolves to `'read'`; none resolves to `'write'` or
`'none'`. The base decision does not expose or decide `profile:leave`'s dates-only
colleague field projection.

**Preconditions:** each listed set is a confirmed, non-empty Phase-0 result;
the fixture contains no unsupported audience source.
