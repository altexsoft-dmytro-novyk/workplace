# ACM3-II-10 · Termination case 2 — an inactive endpoint above a proven viewer is a clean end and Reporting is granted

**Trace:**

- SPEC [CAP-1](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "an edge whose **endpoint is inactive** is unusable and treated as absent for traversal — denying Reporting before viewer proof, and granting it after viewer proof since the chain has then terminated without a repeat, with nothing above the dead node reachable."
- [stories.yaml `ACM-3-scenarios`](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/stories.yaml) — "an edge whose ENDPOINT IS INACTIVE is unusable and treated as absent — denying Reporting before viewer proof and granting it after viewer proof, with nothing above the dead node reachable."
- [access-control.md § Bulk, live, never stored](../../../architecture/access-control.md#bulk-live-never-stored) — "**after** viewer proof the chain has already terminated without a repeat, so Reporting is granted while nothing above the dead node becomes reachable."
- Architecture spine [local AD-1 — Foundation boundary](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — chain-termination taxonomy.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp).

## Scenario

**Given** Jonas reports to Klara, Klara reports to Milo, and Milo reports to
Nika. Jonas, Klara, and Nika are active; **Milo is `isActive = false`**. The
dead node therefore sits one hop above the viewer, with a live person above it.

**When** Klara calls `resolveAudiences(klaraId, [jonasId])`.

**Then** Jonas's walk reaches Klara at the first hop and holds that proof
provisionally. It then examines Klara's manager edge: the row exists, but its
endpoint Milo is inactive, so the edge is **unusable and treated as absent**.
That is a clean end by the same rule that makes a missing edge a clean end —
the chain terminated without repeating a node — so the provisional proof
becomes final and Reporting is **granted** for Jonas. Nothing above Milo is
reachable through this walk: Nika does not become Jonas's ancestor by virtue of
sitting above the dead node.

**Preconditions:** [fixture](../README.md#kernel-fixture--cap-1-completion-this-suite); Jonas,
Klara, Nika active; Milo `isActive = false`; `direct` edges Jonas→Klara,
Klara→Milo, Milo→Nika; no PP relationship among the four.

**Relationship to `ACM3-II-02`.** That scenario proves the **before viewer
proof** half of the same rule: a dead node between the target and the viewer
denies Reporting and leaves the Colleague floor. This one proves the **after
viewer proof** half plus the "nothing above the dead node" clause, on a fixture
that contains both positions at once — Klara is below Milo, Nika is above it.
The two together are the complete termination-case-2 pair the SPEC requires.

**Current vs required — this is NOT a widening, and the dispatch instruction
that says it is, is wrong.** `stories.yaml` `ACM-3-scenarios` instructs the
author to "call out explicitly that the after-viewer-proof GRANT is a behavior
CHANGE, not a restatement", on the stated ground that "the current recursive
CTE joins `users.isActive` in both terms and stops at an inactive node, so it
would deny that case today". That ground is factually wrong, and the scenario
records the verified behavior rather than the instructed one:

- The CTE's two `users.isActive` joins do different jobs. The **base** term
  gates the *target*'s own active state; the **recursive** term gates
  `c.ancestor_id`, the node the walk is climbing *from*. So the walk emits the
  inactive node as an ancestor and then refuses to climb *past* it. It stops
  **above** Milo, not **below** him.
- The final `WHERE ancestor_id = <viewer>` therefore still finds the row
  produced at the first hop, where the ancestor is Klara.
- **Verified against the running migrated PostgreSQL** with this fixture shape
  (`target → viewer → inactive → active`, executed inside a rolled-back
  transaction): the reporting query returned the target. **Today's resolver
  already answers `Set {'reporting'}` for Jonas**, which is exactly what CAP-1
  requires.

The consequence for the reviewer is the opposite of what the dispatch text
implies: approving this scenario approves **no** change to Reporting for this
shape. The Stage-3 risk here is regression, not widening — an implementation of
the new "walk to termination" rule that treats an inactive endpoint as a fault
rather than as a clean end would silently *remove* Reporting that ships today.
That is what Test 1 guards.

**This contradiction is not resolved here.** `stories.yaml` and
`reviews/review-p2-repair.md` finding F-6 both still assert the widening.
Correcting an approved dispatch instruction is a planning decision, not a
scenario-authoring one, so it is raised for the approver alongside this file
rather than edited in. SPEC CAP-1 itself needs no correction: it states the
required behavior and never claims the behavior is new.

## Test 1 — inactive endpoint above the proven viewer is a clean end

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<klara-id>', employeeIds: ['<jonas-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<jonas-id>' => Set {'reporting'}   // dead node above the viewer terminates the chain cleanly
  }
  ```
  Absent members: no `'colleague'`. This test passes today and must keep
  passing — it is the regression guard on the termination rewrite, not a red
  assertion.

## Test 2 — nothing above the dead node becomes reachable

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<nika-id>', employeeIds: ['<jonas-id>', '<klara-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<jonas-id>' => Set {'colleague'},   // Nika sits above the dead node; the walk never reaches her
    '<klara-id>' => Set {'colleague'},   // same denial one hop lower — Milo is between Klara and Nika
  }
  ```
  Absent members: no `'reporting'` for either target. Both parties are active
  in both pairs, so the entries are the Colleague floor rather than an empty
  `Set` — the denial is a path fact, not an identity fact, exactly as in
  `ACM3-II-02`.

## Test 3 — the dead node itself is not a target with an audience

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<klara-id>', employeeIds: ['<milo-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<milo-id>' => Set {}   // inactive target fails identity validation, per ACM3-II-03
  }
  ```
  Included on this fixture so the inactive node's two roles cannot be confused:
  as a **bridge** it is an unusable edge endpoint (Tests 1 and 2), and as a
  **target** it is an identity failure that yields an empty `Set` and never the
  Colleague floor.
