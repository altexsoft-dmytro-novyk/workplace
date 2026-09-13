---
title: 'Make readiness-map snapshot provenance explicit'
type: 'bugfix'
created: '2026-09-13'
status: 'done'
route: 'one-shot'
---

# Make readiness-map snapshot provenance explicit

## Intent

**Problem:** The readiness map mixed current planning and CI evidence with implementation notes copied from a 2026-09-07 static snapshot, presenting all three as though they were reviewed together.

**Approach:** Preserve the manual snapshot but validate and identify its provenance, separate its meaning in the UI, and warn when the trace evidence SHA does not describe the current checkout.

## Suggested Review Order

**Freshness boundary**

- Validates dated manual evidence and compares trace evidence with the checked-out revision.
  [`build-readiness-map.cjs:9`](../../../scripts/build-readiness-map.cjs#L9)

- Makes stale implementation notes and stale CI evidence visibly distinct.
  [`readiness-template.html:1082`](../../../docs/demo/readiness-template.html#L1082)

**Provenance and regression coverage**

- Stores the manual implementation-notes snapshot date alongside its contents.
  [`workplace-readiness-data-2026-09-07.json:1`](../../../docs/demo/workplace-readiness-data-2026-09-07.json#L1)

- Covers malformed provenance, mismatched labels, stale evidence, and the UI contract.
  [`readiness-sync.test.cjs:36`](../../../test/readiness-sync.test.cjs#L36)

- Records the manual re-audit still required to make implementation notes newly current.
  [`deferred-work.md:137`](deferred-work.md#L137)
