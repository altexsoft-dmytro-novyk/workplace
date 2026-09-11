# ACM5-SA-05 · The strongest merged audience wins

**Trace:**

- SPEC [CAP-5](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — merged audiences use `write > read > none`.
- Access Control Foundation [Architecture spine — Design Paradigm](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#design-paradigm) — the public facade is the headless kernel boundary.
- Architecture spine [AD-1](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-1--foundation-boundary-adopted-amended-2026-08-30-p2) — Reporting and direct PP remain distinct Phase-0 outputs.
- Architecture spine [AD-3](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md#ad-3--kernel-evidence-and-consumer-evidence-are-separate-amended-2026-08-30-p2) — the kernel subject is the public facade, never an invented HTTP endpoint.
- [access-control.md § The AccessControl facade](../../../architecture/access-control.md#the-accesscontrol-facade-ad-9) and [§ Multi-audience merge](../../../architecture/access-control.md#multi-audience-merge) — applicable audiences are evaluated independently and the best access wins.
- [testing-strategy.md § The gate (AD-1)](../../../architecture/testing-strategy.md#the-gate-ad-1--no-exceptions-to-ordering-or-stage-separation) and [§ Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp) — this is Stage-1 prose for the facade gate.
- **U-19 normative coverage:** Mechanism-level evidence for `TR-2.1-01` (strongest applicable audience is per section) and `TR-3.1-01` (v1.5 §3.1 — server assembles sections per request) — headless-facade proof, not API E2E. See `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** the unchanged Phase-0 resolver has already produced one target entry
whose set is exactly `Set {'reporting', 'pp'}` from independent valid direct
Reporting and direct-PP facts.

**When** the caller invokes
`AccessControlFacade.canAccessSection(viewerId, 'profile:identity', targetEmployeeId)`.

**Then** the promise resolves to `'write'`. The result is the strongest
applicable access (`write > read > none`), independent of the set's iteration
order; no first-matched or last-matched audience rule may lower it.

**Preconditions:** viewer and target are active and present; the Phase-0 set is
the resolved set for this exact pair, not a policy-derived or projected value.
