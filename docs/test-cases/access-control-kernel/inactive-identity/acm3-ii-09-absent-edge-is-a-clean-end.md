# ACM3-II-09 · Termination case 1 — an absent manager edge is a clean end and Reporting is granted

**Trace:**

- SPEC [CAP-1](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "Chain termination is the absence of a further usable manager edge: an **absent** edge is a clean end".
- [stories.yaml `ACM-3-scenarios`](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/stories.yaml) — "Separate the two termination cases explicitly: an ABSENT manager edge is a clean end".
- [access-control.md § Bulk, live, never stored](../../../architecture/access-control.md#bulk-live-never-stored) — "An **absent** manager edge is a clean chain end."
- Architecture spine [local AD-1 — Foundation boundary](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — chain-termination taxonomy.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp).
- **U-19 normative coverage:** Mechanism-level robustness evidence for `TR-2.1-02` (v1.5 §2.1 — transitive reports-to Reporting line) — headless-facade proof, not API E2E; see caveats in `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** Hana reports to Grzegorz, Grzegorz reports to Igor, and Igor sits at
the top of the tree with **no `direct` relationship row at all**. All three are
active.

**When** Igor calls `resolveAudiences(igorId, [hanaId])`.

**Then** Hana's walk climbs Grzegorz → Igor, proving the viewer provisionally,
then looks for a further manager edge above Igor and finds none. An absent edge
is a clean end, not a fault and not a repeat: the chain terminated without
revisiting a node, so the provisional proof becomes final and Reporting is
**granted** — `{'reporting'}`, with no Colleague alongside it.

**Preconditions:** [fixture](../README.md#kernel-fixture--cap-1-completion-this-suite); Hana,
Grzegorz, Igor all active; `direct` edges Hana→Grzegorz and Grzegorz→Igor; Igor
has **no** row in `relationships` of type `direct` — the edge is absent, not
present-with-a-null-endpoint, which `relationships_shape_check` forbids for
`direct` rows anyway.

**Not a behavior change — the control that keeps the new rule honest.**
Today's resolver grants Reporting here, and so must the new one. Verified
against the running migrated PostgreSQL with this fixture shape: the reporting
query returned the target. The scenario is carried because CAP-1 replaces
"reaching the viewer grants Reporting" with "reaching the viewer is provisional
until the chain terminates cleanly", and every other scenario in that group
asserts a **denial**. Without this one, an implementation that denied Reporting
on every chain — never recognising any termination as clean — would satisfy
`ACM3-II-06`, `ACM3-II-07`, and `ACM3-II-08` completely while breaking the
audience model outright. This is the positive control for the whole
termination rule, and the one that keeps the group from being satisfiable by
`return new Set()`.

## Test 1 — clean top-of-tree termination after viewer proof

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<igor-id>', employeeIds: ['<hana-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<hana-id>' => Set {'reporting'}   // transitive, two hops, chain ends cleanly above the viewer
  }
  ```
  Absent members: no `'colleague'` — the floor never appears beside a granted
  audience.

## Test 2 — the direct-report degenerate case ends the same way

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<grzegorz-id>', employeeIds: ['<hana-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<hana-id>' => Set {'reporting'}   // one hop; the walk continues above Grzegorz to Igor and ends cleanly there
  }
  ```
  Proves the continuation past viewer proof is genuinely walked rather than
  skipped for direct managers: Grzegorz is proven at hop one, and the walk still
  has to reach Igor's absent edge before the grant is final.
