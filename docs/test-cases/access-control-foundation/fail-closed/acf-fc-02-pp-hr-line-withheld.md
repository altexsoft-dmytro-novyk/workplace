# ACF-FC-02 · PP inheritance stops at the assigned People Partner

**Trace:** §2.1 · §3.2 PP · AD-19 · AD-12 · ACF-1

**U-19 normative coverage:** Negative/boundary evidence only for `TR-2.1-05A` (v1.5 §2.1 — recursive PP HR line) — proves the recursive walk is withheld, not the positive walk the row requires (still `PRODUCT/ARCH BLOCKED`). Reworked 2026-09-11 to the resolver audience-set assertion. See `test-design-qa.md` § Normative coverage map.

**Approved:** Anna Pikula, 2026-08-30 (original scenario, HTTP `403` expectation — superseded, see below)
**Reworked & approved:** Anna Pikula, 2026-09-11 — retro-anchor. The resolver behavior and its test (`services/backend` commit `da7d1fa`, 2026-09-03) predate this approval; this is the fresh AD-1 pass the 2026-09-01 note said was still needed, approving the rewrite below rather than a scenario-first change.

> **Expected result reworked — 2026-09-11 (superseded 2026-09-01).** The fail-closed *principle* is unchanged: PP resolution stops at the directly assigned endpoint and does not walk the PP's own manager chain. But the `403` on `GET /users/:id` no longer holds — User Management now returns the S1 identity card (`200`) to any colleague, and Hana is a colleague to Alice ([adoption SPEC](../../../../_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md)). This file now asserts `resolveAudiences(Hana, [Alice])` yields `{colleague}` and does **not** contain `pp` or `reporting`.

## Scenario

**Given** Paula is Alice's assigned People Partner and Paula herself reports to Hana through a live `direct` row, while Hana holds no relationship of her own to Alice.

**When** the facade resolves Hana's audiences for Alice.

**Then** the resolved set is `{colleague}` and contains neither `pp` nor `reporting` — the PP branch resolves only the directly assigned endpoint. Propagation to the PP's own manager chain requires the approved Department contract to define where the HR boundary is; until then, walking an unrestricted reports-to chain and calling it "inside HR" is exactly the fail-open mistake AD-19 forbids. Hana falls back to Colleague.

**Preconditions:** [fixture](../README.md#foundation-fixture); Alice → Paula `people_partner` and Paula → Hana `direct` edges are both live; no edge connects Hana and Alice.

## Test

> **Facade-level case.** Asserted at the facade, not over HTTP — `GET /users/:id` now returns `200` for every audience in `{self, reporting, pp, colleague}`, so an HTTP status can no longer discriminate which audience resolved. The deviation from the `inputURL` skeleton in [../../README.md](../../README.md) is deliberate, matching `ACF-FC-03`.

- **facadeCall:** `accessControl.resolveAudiences(<hana-id>, [<alice-id>])`
- **expectedResult:** the audience set for `<alice-id>` is exactly `{colleague}` — `pp` and `reporting` are both absent. Reaching Alice through Paula's manager chain is a leak, not an inheritance.
