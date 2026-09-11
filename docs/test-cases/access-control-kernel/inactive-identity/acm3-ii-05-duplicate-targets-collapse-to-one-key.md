# ACM3-II-05 · Duplicate requested targets collapse to one map key

**Trace:**

- SPEC [CAP-1](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/SPEC.md#capabilities) — "Each distinct requested target has one map entry and duplicate targets collapse to one key".
- [stories.yaml `ACM-3-scenarios`](../../../../_bmad-output/specs/spec-access-control-kernel-mvp/stories.yaml) — "define one result per distinct target with duplicates collapsing to one key".
- [access-control.md § Audience resolution (AD-10)](../../../architecture/access-control.md#audience-resolution-ad-10) — "resolve audiences per viewer×target employee", i.e. per employee, not per occurrence in the request.
- [access-control.md § Audience columns](../../../architecture/access-control.md#audience-columns-32) — Self row, for the duplicated-viewer half of this scenario.
- [testing-strategy.md § Scoped headless-facade gate](../../../architecture/testing-strategy.md#scoped-headless-facade-gate--access-control-kernel-mvp).
- **U-19 normative coverage:** Mechanism-level robustness evidence for `TR-2.1-02` (v1.5 §2.1 — transitive reports-to Reporting line) — headless-facade proof, not API E2E; see caveats in `test-design-qa.md` § Normative coverage map.

## Scenario

**Given** Mila is an active viewer and the active direct manager of Dana.

**When** Mila calls `resolveAudiences(milaId, [danaId, danaId, milaId, milaId, danaId])`,
a request whose list repeats an ordinary target three times and the viewer's own
id twice.

**Then** the returned map has exactly **two** keys — Dana and Mila — each
carrying a single audience `Set`: Dana is `{'reporting'}` and Mila is
`{'self'}`. Repetition changes neither the key count nor the contents of any
set. The duplicated ids also do not reach the relationship graph more than
once: the port receives each distinct non-viewer target exactly once, and the
viewer's own id never reaches it at all.

**Preconditions:** [fixture](../README.md#kernel-fixture--cap-1-completion-this-suite); Mila
active, `reportsToUserId` null; Dana active, `direct` report of Mila; no PP
relationship for either — this scenario is about key identity, so no second
audience source may be present to confuse a duplicated key with a duplicated
label.

**Relationship to `ACM4R-MA-04`.** That CAP-2 scenario proves a repeated target
does not duplicate **audiences** when two audiences legitimately coexist
(Reporting + direct PP). This one proves the CAP-1 half: the **map key** itself
collapses, and the viewer's own repeated id collapses with it. They are
different claims over the same input shape and neither substitutes for the
other.

**Not a behavior change — regression guard.** Already-shipped behavior:
`AudienceResolverService.resolve` computes `targets = [...new Set(employeeIds)]`
before anything else and derives `others` from that deduplicated list. The
scenario is carried because CAP-1's new identity-validation ordering rewrites
the top of exactly that method, and a rewrite that validates and maps in one
pass over the raw `employeeIds` array would reintroduce duplicate keys — a
silently wrong result shape for every bulk caller, not a visible failure.

## Test 1 — repeated ordinary target and repeated viewer id in one call

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  {
    viewerId: '<mila-id>',
    employeeIds: ['<dana-id>', '<dana-id>', '<mila-id>', '<mila-id>', '<dana-id>'],
  }
  ```
- **expectedResult:**
  ```ts
  Map {
    '<dana-id>' => Set {'reporting'},
    '<mila-id>' => Set {'self'},
  }
  ```
  Assert `audiences.size === 2` explicitly: a map that returned the right
  entries alongside a third, duplicate-derived key would still be wrong, and
  entry-by-entry assertions alone would not catch it.

## Test 2 — duplication does not duplicate the graph read

- **facadeCall:** `accessControlFacade.resolveAudiences(viewerId, employeeIds)`
- **input:**
  ```ts
  {
    viewerId: '<mila-id>',
    employeeIds: ['<dana-id>', '<dana-id>', '<mila-id>'],
  }
  ```
- **expectedResult:** as Test 1, minus the third key; plus an assertion at the
  `RELATIONSHIP_GRAPH_PORT` boundary that `loadAudienceFacts` was called once
  with `targetIds` equal to `['<dana-id>']` — one occurrence of Dana, and no
  Mila. Confirms deduplication happens before the read, so the §7 500-record
  budget cannot be spent on repeated ids, and confirms the port's documented
  precondition that "`targetIds` never contains the viewer".
