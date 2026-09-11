# ACM5-SA-08 · Empty Phase-0 audiences return none for every supported section

**Trace:**

- SPEC [CAP-5](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — an empty audience set returns `none`.
- Access Control Foundation [Architecture spine — Design Paradigm](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#design-paradigm) — the public facade is the headless kernel boundary.
- Architecture spine [AD-1](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-1--foundation-boundary-adopted-amended-2026-08-30-p2) — inactive or unconfirmed identities produce an empty audience set rather than Self or Colleague.
- Architecture spine [AD-3](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-3--kernel-evidence-and-consumer-evidence-are-separate-amended-2026-08-30-p2) — the kernel subject is the public facade, never an invented HTTP endpoint.
- [access-control.md § The AccessControl facade](../../../architecture/access-control.md#the-accesscontrol-facade-ad-9) and [§ Audience columns](../../../architecture/access-control.md#audience-columns-32) — base access consumes confirmed audiences, and identity failure derives none.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) and [§ Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — this is Stage-1 prose for the facade gate.
- **U-19 normative coverage:** Weak mechanism-level support for `TR-3.1-01` (v1.5 §3.1 — server assembles sections per request) — headless-facade edge-case proof, not API E2E. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** the already-shipped Phase-0 resolver returns `Set {}` for a
viewer/target pair, for example because the viewer or target is inactive.

**When** the caller invokes
`AccessControlFacade.canAccessSection(viewerId, section, targetEmployeeId)`
once each with `section` equal to `'profile:identity'`, `'profile:leave'`, and
`'profile:projects'`.

**Then** every promise resolves to `'none'`. No supported section can turn an
empty audience set into `read` or `write`.

**Preconditions:** the empty set arises from Phase-0 behavior, not from an
infrastructure failure; `resolveAudiences` remains unchanged.
