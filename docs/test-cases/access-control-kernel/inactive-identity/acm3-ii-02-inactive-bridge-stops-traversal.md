# ACM3-II-02 · Inactive bridge inside the chain stops traversal

**Trace:**

- SPEC [CAP-1](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "An edge whose **endpoint is inactive** is unusable and treated as absent for traversal — denying Reporting before viewer proof... Self and direct PP are evaluated independently of any Reporting denial, and Colleague follows the ordinary no-stronger-audience fallback."
- Architecture spine [local AD-1 — Foundation boundary](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — "Chain-termination taxonomy: ... An edge whose **endpoint is inactive** is unusable and is treated as absent for traversal: before viewer proof the viewer is unproven and Reporting is denied."
- Inherited AD-11 / AD-12 (fail-closed relationship facts).
- [access-control.md § Bulk, live, never stored](../../../architecture/access-control.md#bulk-live-never-stored) — "An edge whose **endpoint is inactive** is treated as **no edge** — the walk terminates fail-closed there, with no transitive continuation past the dead node," and the reporting-walk fail-closed filter comment in `PrismaRelationshipGraphAdapter`: "a deactivated person is neither a reachable node nor a bridge."
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp).

## Scenario

**Given** a reporting chain Alice → Bob → DeadNode → Carol, where Alice, Bob,
and Carol are all active but DeadNode (Bob's manager, Carol's report) has
`isActive = false`. Carol sits above DeadNode at the top of the tree.

**When** Carol — an active viewer with no other relationship to Alice — calls
`resolveAudiences(carolId, [aliceId])`.

**Then** Reporting is **denied** for Alice: the walk reaches DeadNode (Bob is
active, so Bob is a usable bridge up to DeadNode) but cannot use DeadNode
itself as a further bridge, so it never climbs past DeadNode to reach and
prove Carol. Because Carol herself is fully active and identity validation
passes for both viewer and target, resolution does not fail closed to an empty
`Set` the way `ACM3-II-01` and `ACM3-II-03` do — it falls through to the
ordinary Colleague floor, since no stronger audience applies. This is the
scenario's own distinguishing signature: Reporting is denied for a **path**
reason, not an identity reason, and the map entry is Colleague, not empty.

**Preconditions:** [fixture](../README.md#kernel-fixture-this-suite); Alice
active, direct report of Bob; Bob active, direct report of DeadNode; DeadNode
`isActive = false`, direct report of Carol; Carol active,
`reportsToUserId` null; no PP relationship for Carol or Alice.

**Not a behavior change:** unlike `ACM3-II-01` and `ACM3-II-03`, this is
existing, already-shipped fail-closed traversal behavior — the Reporting CTE's
`JOIN "users" u ON u.id = c.ancestor_id AND u."isActive" = TRUE` already
refuses to use an inactive node as a bridge, which is the same mechanism
`ACF-FC-01`'s broken-edge fixture (`Erin`/`InactiveMgr`/`Frank`) already
exercised under the Phase-0 facade. This scenario re-proves the identical
mechanism against the typed `AccessControlFacade.resolveAudiences` map result
instead of the Phase-0 HTTP surface, and confirms the Colleague fallback still
fires correctly once Reporting is denied for a broken-path reason rather than
an identity reason.

## Test 1 — bridge deactivation denies Reporting, Colleague is the floor

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<carol-id>', employeeIds: ['<alice-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<alice-id>' => Set {'colleague'}   // reporting denied by the dead bridge; colleague is the floor
  }
  ```
  Absent members: no `'reporting'` in the set for `<alice-id>` — the walk
  terminated at DeadNode and never reached Carol.

## Test 2 — Bob, directly below the dead node, is unaffected

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<bob-id>', employeeIds: ['<alice-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<alice-id>' => Set {'reporting'}   // Bob is Alice's direct manager; DeadNode is above Bob, not between Bob and Alice
  }
  ```
  Confirms the deactivation only breaks traversal **past** DeadNode, not the
  live edge below it — the failure is specific to the broken segment of the
  chain, not a systemic fault in the fixture.
