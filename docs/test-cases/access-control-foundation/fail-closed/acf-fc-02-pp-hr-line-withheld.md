# ACF-FC-02 · PP inheritance stops at the assigned People Partner

**Trace:** §2.1 · §3.2 PP · AD-19 · AD-12 · ACF-1

**Approved:** Anna Pikula, 2026-08-30 · **Reworked:** 2026-09-07 (`1-3a`), resolver oracle unchanged

> **Supersession history.** Authored 2026-08-30 as a `403` on `GET /users/:id`. The fail-closed
> *principle* is unchanged: PP resolution stops at the directly assigned endpoint and does not
> walk the PP's own manager chain. But the 2026-09-01 User Management contract returns the S1
> identity card (`200`) to any colleague, and Hana is a colleague to Alice
> ([adoption SPEC](../../../../_bmad-output/specs/spec-user-management-access-control-adoption/SPEC.md)),
> so HTTP status stopped being the resolver oracle. The scenario now asserts the resolver
> audience set directly. The E2E rework shipped in `services/backend` `da7d1fa`
> (`test/access-control/audience-resolution.e2e-spec.ts`); this doc is brought in line with it.
> The resolver behaviour never changed. The 2026-08-30 / 2026-09-01 approval records are
> preserved above.

## Scenario

**Given** Paula is Alice's assigned People Partner and Paula herself reports to Hana through a live `direct` row, while Hana holds no relationship of her own to Alice.

**When** Hana's audience over Alice is resolved.

**Then** the resolver returns exactly `{colleague}` — the PP branch resolves only the directly assigned endpoint, so the set does **not** contain `pp` (nor `reporting`). Propagation to the PP's own manager chain requires the approved Department contract to define where the HR boundary is; until then, walking an unrestricted reports-to chain and calling it "inside HR" is exactly the fail-open mistake AD-19 forbids. Hana falls back to Colleague.

**Preconditions:** [fixture](../README.md#foundation-fixture); Alice → Paula `people_partner` and Paula → Hana `direct` edges are both live; no edge connects Hana and Alice.

## Test

- **subject:** `AccessControlFacade.resolveAudiences(<hana-id>, [<alice-id>])`
- **expectedResult:** the audience set for `<alice-id>` is exactly `['colleague']` and contains neither `pp` nor `reporting` — reaching Alice through Paula's manager chain is a leak, not an inheritance. Asserted with `expectAudienceLabels` plus explicit `has('pp')` / `has('reporting')` false checks (`test/access-control/audience-resolution.e2e-spec.ts`, `ACF-FC-02` block).
