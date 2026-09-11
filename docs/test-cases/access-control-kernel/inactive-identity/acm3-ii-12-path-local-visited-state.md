# ACM3-II-12 · Reporting visited state is path-local — shared ancestors are not repeats

**Trace:**

- SPEC [CAP-1](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "Reporting visited state is path-local per target, and shared ancestors across targets are valid."
- [stories.yaml `ACM-3-scenarios`](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/stories.yaml) — "Prove path-local visited state and shared-ancestor validity".
- [access-control.md § Bulk, live, never stored](../../../architecture/access-control.md#bulk-live-never-stored) — "Reporting visited state is path-local to each requested target; shared ancestors across target walks are not repeats."
- Architecture spine [local AD-1 — Foundation boundary](../../../../_bmad-output/planning-artifacts/architecture/architecture-access-control-foundation-2026-08-29/ARCHITECTURE-SPINE.md).
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp).
- **U-19 normative coverage:** Mechanism-level robustness evidence for `TR-2.1-02` (v1.5 §2.1 — transitive reports-to Reporting line) — headless-facade proof, not API E2E; see caveats in `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** Ada and Borys both report to Cyril, and Cyril reports to Dmytro. Eva
reports to Fedir, Fedir reports to Hlib, and Hlib reports back to Fedir — a
cycle on a separate branch that Dmytro is not part of. All six are active.

**When** Dmytro calls `resolveAudiences(dmytroId, [adaId, borysId, evaId])` in
one bulk request.

**Then** Ada and Borys each resolve to `{'reporting'}`. Their two walks share
every node above Cyril — Cyril and Dmytro both appear in both walks — and that
sharing is **not** a repeat: visited state belongs to one target's own path,
not to the request. Eva resolves to `{'colleague'}`, because her own path
repeats Fedir. The three results together state the rule precisely: a node
seen twice **on one path** denies that path, while a node seen once on each of
two paths denies nothing.

**Preconditions:** [fixture](../README.md#kernel-fixture--cap-1-completion-this-suite); Ada,
Borys, Cyril, Dmytro, Eva, Fedir, Hlib all active; `direct` edges Ada→Cyril,
Borys→Cyril, Cyril→Dmytro, Eva→Fedir, Fedir→Hlib, Hlib→Fedir; Dmytro has
`reportsToUserId` null and no PP relationship to any target.

**Not a behavior change — regression guard against a specific wrong fix.**
Today's CTE is path-local by construction: every row it carries is a
`(target_id, ancestor_id)` pair, so the `UNION` deduplicates within one
target's walk and never across targets. Verified against the running migrated
PostgreSQL with this fixture shape: the reporting query returned **both**
shared-ancestor targets. The scenario is carried because CAP-1's new
acyclicity rule is most naturally implemented with a visited set, and the
cheapest wrong version of that is **one** set for the whole request. That
version passes every cycle scenario in this suite and silently denies Reporting
to every target after the first in any bulk call whose targets share a manager
— which is to say, to almost every real bulk call. Nothing else in the group
catches it, and a manager listing their own team is the exact shape that
breaks.

## Test 1 — two targets sharing every ancestor above them

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<dmytro-id>', employeeIds: ['<ada-id>', '<borys-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<ada-id>'   => Set {'reporting'},
    '<borys-id>' => Set {'reporting'},   // the shared Cyril → Dmytro segment is not a repeat
  }
  ```
  Order independence is part of the assertion: the same two entries must come
  back when the input order is reversed, so a first-wins visited set cannot
  pass by accident.

## Test 2 — a cyclic target alongside two shared-ancestor targets

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  { viewerId: '<dmytro-id>', employeeIds: ['<ada-id>', '<borys-id>', '<eva-id>'] }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<ada-id>'   => Set {'reporting'},
    '<borys-id>' => Set {'reporting'},
    '<eva-id>'   => Set {'colleague'},   // her own path repeats Fedir
  }
  ```
  Proves the two rules coexist in one call: per-path denial for Eva, shared
  ancestry accepted for Ada and Borys, and no interference in either direction.
