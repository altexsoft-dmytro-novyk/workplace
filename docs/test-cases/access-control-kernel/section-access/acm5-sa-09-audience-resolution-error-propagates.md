# ACM5-SA-09 · An audience-resolution infrastructure error propagates

**Trace:**

- SPEC [CAP-5](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — `none` denotes a successful read only; it is not an infrastructure-error fallback.
- Access Control Foundation [Architecture spine — Design Paradigm](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#design-paradigm) — the public facade is the headless kernel boundary.
- Architecture spine [AD-1](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-1--foundation-boundary-adopted-amended-2026-08-30-p2) — Phase-0 inputs remain live and fail closed only for its defined identity/audience results.
- Architecture spine [AD-3](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-3--kernel-evidence-and-consumer-evidence-are-separate-amended-2026-08-30-p2) — the kernel subject is the public facade, never an invented HTTP endpoint.
- [access-control.md § The AccessControl facade](../../../architecture/access-control.md#the-accesscontrol-facade-ad-9) and [§ Audience columns](../../../architecture/access-control.md#audience-columns-32) — section access consumes the live audience result and does not substitute a policy-table decision.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) and [§ Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — this is Stage-1 prose for the facade gate.
- **U-19 normative coverage:** Weak mechanism-level support for `TR-3.1-01` (v1.5 §3.1 — server assembles sections per request) — headless-facade edge-case proof, not API E2E. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** the underlying `resolveAudiences(viewerId, [targetEmployeeId])`
operation encounters an infrastructure error while obtaining the audience
result.

**When** the caller invokes
`AccessControlFacade.canAccessSection(viewerId, 'profile:identity', targetEmployeeId)`.

**Then** the promise rejects with that error; it never resolves to `'none'`,
`'read'`, or `'write'` as a silent fallback.

**Preconditions:** the failure is an infrastructure failure during audience
resolution, not a valid empty audience set, an unsupported section, or a
missing target.
