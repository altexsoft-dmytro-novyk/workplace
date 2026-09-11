# ACM3-II-04 · Empty target list returns an empty map with no relationship-graph read

**Trace:**

- SPEC [CAP-1](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "an empty target list returns an empty map immediately with no relationship-graph read".
- [stories.yaml `ACM-3-scenarios`](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/stories.yaml) — "cover an empty target list returning an empty map with no relationship-graph read, preserving the inherited Phase-0 short-circuit".
- [access-control.md § Bulk short-circuit](../../../architecture/access-control.md#bulk-short-circuit) — "`resolveAudiences(viewerId, [])` returns an empty map immediately — no graph walks or policy queries."
- [access-control.md § Bulk, live, never stored](../../../architecture/access-control.md#bulk-live-never-stored) — the 500-record / 2-second §7 budget the short-circuit protects.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp).
- **U-19 normative coverage:** Mechanism-level robustness evidence for `TR-2.1-02` (v1.5 §2.1 — transitive reports-to Reporting line) — headless-facade proof, not API E2E; see caveats in `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** Nora is an active viewer, and the database holds an ordinary
relationship graph she participates in (so a graph read, if one happened,
would return rows rather than trivially nothing).

**When** Nora calls `resolveAudiences(noraId, [])` with an empty target list.

**Then** the call returns an empty `Map` — zero keys — and the
`RelationshipGraphPort` is never consulted: no reporting walk, no PP lookup, no
transaction opened. The assertion that distinguishes this scenario from "the
result happened to be empty" is the **port call count**, which must be zero.
An implementation that queried the graph and then returned an empty map would
satisfy the value but violate the contract.

**Preconditions:** [fixture](../README.md#kernel-fixture--cap-1-completion-this-suite); Nora
active, direct manager of at least one active report, so an executed graph read
would be observable as a non-trivial one.

**Not a behavior change — regression guard.** This is already-shipped behavior:
`AudienceResolverService.resolve` returns the empty map before computing
`targets` or touching the port, and `PrismaRelationshipGraphAdapter.loadAudienceFacts`
carries its own `targetIds.length === 0` guard. The scenario exists because
CAP-1's other requirements — viewer identity validation before all derivation —
invite an implementation that validates the viewer first and so reaches the
database on an empty request. The ordering rule this scenario fixes is
therefore explicit: **the empty-bulk short-circuit precedes viewer identity
validation**, because there is nothing to derive and nothing to fail closed
about. A viewer whose identity would fail validation still receives the same
empty map here, and no read is issued to discover that.

## Test 1 — empty target list, active viewer

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<nora-id>', employeeIds: [] }
  ```
- **expectedResult:**
  ```ts
  Map {}   // zero keys
  ```
  Additional assertion, at the `RELATIONSHIP_GRAPH_PORT` boundary:
  `loadAudienceFacts` was called **0 times**. Observing the port here is the
  point of the test, not an implementation detail — the requirement is the
  absent read, not the empty value.

## Test 2 — empty target list, viewer who would fail identity validation

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<inactive-owen-id>', employeeIds: [] }
  ```
- **expectedResult:**
  ```ts
  Map {}   // zero keys — same result, same absent read
  ```
  Additional assertion: `loadAudienceFacts` was called **0 times**, and no
  `users` lookup was issued for the viewer either. Proves the short-circuit
  sits above the identity gate rather than after it, so an empty request costs
  nothing even when the viewer is invalid.
