# ACM3-II-06 · A repeated node reached before viewer proof ends the walk and denies Reporting

**Trace:**

- SPEC [CAP-1](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "A repeated node anywhere in the chain, **before or after viewer proof**, denies Reporting for that target only, so a viewer inside a cycle is denied rather than proven."
- [stories.yaml `ACM-3-scenarios`](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/stories.yaml) — "cover a repeated node before viewer proof and a repeated node after it ... show each denies Reporting for that target only".
- [access-control.md § Bulk, live, never stored](../../../architecture/access-control.md#bulk-live-never-stored) — "A repeated node anywhere in the chain, **before or after viewer proof**, denies Reporting for that target only and stops the walk".
- Architecture spine [local AD-1 — Foundation boundary](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md) — provisional viewer proof and the acyclicity condition.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp).
- **U-19 normative coverage:** Mechanism-level robustness evidence for `TR-2.1-02` (v1.5 §2.1 — transitive reports-to Reporting line) — headless-facade proof, not API E2E; see caveats in `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** Rhea reports to Kai, Kai reports to Lena, and Lena reports back to Kai
— a two-node cycle sitting above the target. Sasha is an active viewer who is
not on that chain at all, and who is separately the active direct manager of
Tess.

**When** Sasha calls `resolveAudiences(sashaId, [rheaId, tessId])`.

**Then** Rhea's walk climbs Kai → Lena → Kai, meets a node it has already
visited on that path, and **stops there**. The viewer was never proven, so
Reporting is denied for Rhea; because Sasha and Rhea are both present and
active, resolution does not fail closed to an empty `Set` — it falls through to
the ordinary Colleague floor. Tess, requested in the same call, is unaffected
and resolves to `{'reporting'}`: the cycle denies one target's Reporting, not
the request.

**Preconditions:** [fixture](../README.md#kernel-fixture--cap-1-completion-this-suite); Rhea,
Kai, Lena, Sasha, Tess all active; `direct` edges Rhea→Kai, Kai→Lena,
Lena→Kai, Tess→Sasha; Sasha has `reportsToUserId` null and no PP relationship
to Rhea or Tess. The cycle is insertable today:
`relationships_one_direct_per_user` permits one `direct` row per person and
`relationships_no_self_endpoint_check` only forbids self-reference, so the
smallest constructible cycle has length two — Kai ⇄ Lena.

**Why "before viewer proof" has this shape, and why it can have no other.**
Each person carries at most one `direct` row
(`relationships_one_direct_per_user`), so an upward walk is a linked list, not
a tree: once it enters a cycle it can never leave it, and every node reachable
after the first repeat was already visited. A viewer who is reachable at all is
therefore always reached **before or at** the first repeat. "A repeated node
before viewer proof" consequently means exactly one thing under this schema —
**the repeat is what ends the walk and the viewer is never proven** — and a
constructible case where the viewer becomes reachable only after a repeat does
not exist. This is recorded so a reviewer does not read the missing case as
missing coverage; the two constructible cycle positions are this scenario and
[`ACM3-II-07`](acm3-ii-07-repeat-after-viewer-proof.md), with
[`ACM3-II-08`](acm3-ii-08-viewer-inside-the-cycle.md) covering the viewer's own
membership in the cycle.

**Not a behavior change — code-verified.** Today's recursive CTE terminates on
this shape by construction: its recursive term is `UNION`, not `UNION ALL`, so
the duplicate `(target_id, ancestor_id)` row ends the recursion, and the final
`WHERE ancestor_id = <viewer>` finds no match because Sasha is not on the
chain. Verified against the running migrated PostgreSQL with this fixture
shape: the reporting query returned **0 rows** for the cyclic target, so
today's resolver already answers `{'colleague'}`. The value of this scenario is not the change —
there is none — but the guard: an implementation of CAP-1's new "continue to
chain termination" rule that walks without path-local visited state does not
return a wrong answer here, it **does not terminate**, and the adapter's
`SET LOCAL statement_timeout = '2s'` is the only thing standing between that
and a held connection. This scenario is the one that fails fast if the repeat
detection is dropped.

## Test 1 — cycle above the target, viewer not on the chain

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<sasha-id>', employeeIds: ['<rhea-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<rhea-id>' => Set {'colleague'}   // reporting denied by the repeat; identity of both parties is fine
  }
  ```
  Absent members: no `'reporting'` for `<rhea-id>`. The call must also
  **return**, not time out: assert completion well inside the adapter's 2-second
  statement timeout, so a non-terminating walk fails as a failure rather than
  as a slow pass.

## Test 2 — the denial is local to the cyclic target

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<sasha-id>', employeeIds: ['<rhea-id>', '<tess-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<rhea-id>' => Set {'colleague'},   // cyclic chain — reporting denied
    '<tess-id>' => Set {'reporting'},   // clean chain in the same call — unaffected
  }
  ```
  Proves the repeat is scoped to Rhea's own walk and does not abort, poison, or
  short-circuit the bulk request.
