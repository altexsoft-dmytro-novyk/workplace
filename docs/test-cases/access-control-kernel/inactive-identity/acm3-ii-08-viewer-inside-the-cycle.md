# ACM3-II-08 · A viewer inside the cycle is denied rather than proven

**Trace:**

- SPEC [CAP-1](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "A repeated node anywhere in the chain, **before or after viewer proof**, denies Reporting for that target only, so a viewer inside a cycle is denied rather than proven."
- [stories.yaml `ACM-3-scenarios`](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/stories.yaml) — "including a viewer that is itself inside a cycle".
- [access-control.md § Bulk, live, never stored](../../../architecture/access-control.md#bulk-live-never-stored) — "a viewer inside a cycle is therefore denied rather than proven".
- Architecture spine [local AD-1 — Foundation boundary](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md).
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp).
- **U-19 normative coverage:** Mechanism-level robustness evidence for `TR-2.1-02` (v1.5 §2.1 — transitive reports-to Reporting line) — headless-facade proof, not API E2E; see caveats in `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** Ivan reports to Yulia, Yulia reports to Zoran, and Zoran reports back
to Yulia. The viewer, Yulia, is herself one of the two nodes of the cycle. All
three are active.

**When** Yulia calls `resolveAudiences(yuliaId, [ivanId, zoranId, yuliaId])` —
one target below the cycle, one target that is the cycle's other member, and
her own id.

**Then** Ivan's walk reaches Yulia at the first hop, holds that proof as
provisional, continues Zoran → Yulia, and meets Yulia a second time. The chain
did not terminate; it closed on itself. Reporting is denied for Ivan and the
entry falls to the Colleague floor. Zoran's walk reaches Yulia (proof), then
climbs to Zoran — the target itself, already visited as the walk's own start —
and is denied for the same reason. Yulia's own id is `{'self'}`: her membership
in a cycle is a fact about the reporting graph and has no bearing on the
identity check that settles Self, which is confirmed presence and active state
for both parties.

**Preconditions:** [fixture](../README.md#kernel-fixture--cap-1-completion-this-suite); Ivan,
Yulia, Zoran all active; `direct` edges Ivan→Yulia, Yulia→Zoran, Zoran→Yulia;
no PP relationship among the three. Yulia has no `reportsToUserId = null`
terminus — that is the whole point of the shape: **there is no chain end above
her**, so "walk to termination" can only end at a repeat.

**Current vs required (code-verified gap this scenario closes).** Today the
decision is reachability, not acyclicity: the CTE walks Ivan → Yulia → Zoran →
Yulia, the `UNION` ends the recursion on the duplicate row, and
`WHERE ancestor_id = <yulia>` matches on the row produced at the first hop.
Verified against the running migrated PostgreSQL with this fixture shape: the
reporting query returned the target, so **today's resolver answers
`Set {'reporting'}` for Ivan** — a viewer inside a cycle is currently proven by
the very cycle that should disqualify her. Required behavior is
`Set {'colleague'}`. A reviewer approving this scenario is approving a
**narrowing**, and specifically the one the product owner's cycle-supersession
decision was taken to produce: cyclic management data denies rather than
grants, so a data-entry loop cannot manufacture reach.

## Test 1 — target below a viewer who sits inside the cycle

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<yulia-id>', employeeIds: ['<ivan-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<ivan-id>' => Set {'colleague'}   // the chain closes on the viewer instead of terminating
  }
  ```
  Absent members: no `'reporting'` for `<ivan-id>` — the assertion that fails
  against today's production code.

## Test 2 — the cycle's other member as the target

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<yulia-id>', employeeIds: ['<zoran-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<zoran-id>' => Set {'colleague'}   // the walk returns to its own start node
  }
  ```
  Proves the repeat rule counts the **target itself** as a visited node, not
  only the ancestors discovered after it. An implementation that seeded its
  visited set with the first ancestor rather than the target would pass Test 1
  and fail here.

## Test 3 — Self is settled by identity, not by the graph

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<yulia-id>', employeeIds: ['<ivan-id>', '<zoran-id>', '<yulia-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<ivan-id>'  => Set {'colleague'},
    '<zoran-id>' => Set {'colleague'},
    '<yulia-id>' => Set {'self'},   // exclusive; a cyclic viewer is still a confirmed identity
  }
  ```
