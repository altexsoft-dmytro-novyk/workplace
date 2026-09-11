# ACM5-SA-07 · A missing target returns none

**Trace:**

- SPEC [CAP-5](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — a successful read for a missing target returns `none`.
- Access Control Foundation [Architecture spine — Design Paradigm](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#design-paradigm) — the public facade is the headless kernel boundary.
- Architecture spine [AD-1](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-1--foundation-boundary-adopted-amended-2026-08-30-p2) — unconfirmed identity derives no Phase-0 audience.
- Architecture spine [AD-3](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-3--kernel-evidence-and-consumer-evidence-are-separate-amended-2026-08-30-p2) — the kernel subject is the public facade, never an invented HTTP endpoint.
- [access-control.md § The AccessControl facade](../../../architecture/access-control.md#the-accesscontrol-facade-ad-9) and [§ Audience columns](../../../architecture/access-control.md#audience-columns-32) — identity validation precedes audience derivation and the facade returns only a base decision.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) and [§ Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — this is Stage-1 prose for the facade gate.
- **U-19 normative coverage:** Weak mechanism-level support for `TR-3.1-01` (v1.5 §3.1 — server assembles sections per request) — headless-facade edge-case proof, not API E2E. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** `targetEmployeeId` is well-formed but identifies no User, while the
viewer is present and active.

**When** the caller invokes
`AccessControlFacade.canAccessSection(viewerId, section, targetEmployeeId)`
once each with `section` equal to `'profile:identity'`, `'profile:leave'`, and
`'profile:projects'`.

**Then** every promise resolves successfully to `'none'`. A nonexistent target
is not a thrown application error and cannot receive a base section grant for
any CAP-5-supported section.

**Preconditions:** the missing id matches no persisted User; Phase-0 retains
its already-shipped fail-closed missing-target behavior.
