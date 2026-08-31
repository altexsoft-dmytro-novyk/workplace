# ACM3-II-07 · A repeated node above a proven viewer denies Reporting for that target

**Trace:**

- SPEC [CAP-1](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "Reaching the viewer proves the viewer sits on that target's chain but is **provisional**: the walk continues to chain termination, and Reporting is granted only when that target's whole walked chain terminates without repeating a node. A repeated node anywhere in the chain, **before or after viewer proof**, denies Reporting for that target only ... Self and direct PP are evaluated independently of any Reporting denial".
- [stories.yaml `ACM-3-scenarios`](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/stories.yaml) — "prove that reaching the viewer is provisional and does not by itself grant Reporting ... show each denies Reporting for that target only while valid Self and direct PP paths remain".
- [access-control.md § Bulk, live, never stored](../../../architecture/access-control.md#bulk-live-never-stored) — provisional proof, continuation to termination, per-target denial.
- Architecture spine [local AD-1 — Foundation boundary](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md).
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp).

## Scenario

**Given** Piotr and Quinn both report directly to Vera, Vera reports to Nils,
Nils reports to Olek, and Olek reports back to Nils — a two-node cycle sitting
**above** the viewer. Quinn additionally has a `people_partner` edge whose
endpoint is Vera. All five people are active.

**When** Vera calls `resolveAudiences(veraId, [piotrId, quinnId, veraId])`.

**Then** Piotr's walk reaches Vera at the first hop — the viewer is on the
chain — but that proof is **provisional**. The walk continues: Nils, Olek,
Nils, which repeats a node already visited on this path. The chain therefore
did not terminate cleanly, and Reporting is denied for Piotr; with both parties
present and active, the entry falls to the Colleague floor. Quinn's Reporting
is denied for the same reason on the same chain, but Quinn's **direct PP** edge
to Vera is evaluated independently of the Reporting denial and survives, so
Quinn resolves to `{'pp'}` — not Colleague, because a stronger valid audience
remains. Vera's own id resolves to `{'self'}`: Self is settled by the confirmed
identity of viewer and target, never by the state of a reporting walk.

**Preconditions:** [fixture](../README.md#kernel-fixture--cap-1-completion-this-suite); Piotr,
Quinn, Vera, Nils, Olek all active; `direct` edges Piotr→Vera, Quinn→Vera,
Vera→Nils, Nils→Olek, Olek→Nils; one `people_partner` edge Quinn→Vera; no PP
edge for Piotr. Vera is deliberately **not** part of the cycle — that case is
[`ACM3-II-08`](acm3-ii-08-viewer-inside-the-cycle.md).

**Current vs required (code-verified gap this scenario closes).** Today's
reporting CTE collects every reachable ancestor per target and then asks a
single question — `WHERE ancestor_id = <viewer>` — so **reaching** the viewer
is the whole decision and the nodes above the viewer are irrelevant to it. The
`UNION` recursive term terminates on the cycle, but termination is not the
same as denial: Vera is already in the chain, so the match fires. Verified
against the running migrated PostgreSQL with this fixture shape: the reporting
query returned the cyclic target, so **today's resolver answers
`Set {'reporting'}` for Piotr and `Set {'reporting','pp'}` for Quinn**. Required behavior is
`{'colleague'}` and `{'pp'}` respectively. A reviewer approving this scenario
is approving a **narrowing** of currently shipped behavior — a manager sitting
below a cyclic segment of the org chart loses Reporting over their own reports
until the cycle is corrected in the data. That is the deliberate fail-closed
choice recorded in the memlog as the product owner's cycle-supersession
decision, not an incidental consequence.

## Test 1 — proven viewer, cycle above, Reporting denied

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<vera-id>', employeeIds: ['<piotr-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<piotr-id>' => Set {'colleague'}   // viewer proof was provisional; the chain never terminated cleanly
  }
  ```
  Absent members: no `'reporting'` for `<piotr-id>` — this is the assertion
  that fails against today's production code.

## Test 2 — direct PP survives the Reporting denial

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<vera-id>', employeeIds: ['<quinn-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<quinn-id>' => Set {'pp'}   // reporting denied by the cycle; the assigned PP edge is unaffected
  }
  ```
  Absent members: no `'reporting'` (denied by the repeat) and no `'colleague'`
  (the floor applies only when no stronger valid audience remains). Proves the
  Reporting denial is scoped to the Reporting column and does not cascade into
  a fail-closed empty set or displace PP.

## Test 3 — Self is unaffected by the walk

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<vera-id>', employeeIds: ['<piotr-id>', '<quinn-id>', '<vera-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<piotr-id>' => Set {'colleague'},
    '<quinn-id>' => Set {'pp'},
    '<vera-id>'  => Set {'self'},   // confirmed viewer and target; exclusive, and never reaches the graph
  }
  ```
  Proves all three columns resolve independently within one bulk call while the
  viewer stands inside a graph whose upper segment is cyclic.
