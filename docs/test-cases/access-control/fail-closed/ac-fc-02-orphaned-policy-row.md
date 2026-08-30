# AC-FC-02 · Orphaned relationship edge after hard-delete

**Trace:** spine AD-4 (fail-closed on malformed data) · AD-5 (Relationship edges)

**Corrected 2026-08-30:** the original scenario used Pete's Project-line policy as its baseline positive grant, with Test 1 self-labeled "sole fail-closed-suite project-line positive." That directly contradicted this suite's own README ("Phase 1 gates... withhold negatives only — no positive grants yet") and the SPEC's Constraints ("Project... grants nothing... until its contract and AD-1 suite are approved"), and produced a result inconsistent with the sibling `matrix/project-line-gate/AC-PG-03` scenario, which uses the identical fixture shape and correctly expects `404`. Rewritten to use Bob's Reporting-line grant (a real Phase 1 positive) as the baseline, and to orphan the underlying `Relationship` edge directly — same fail-closed intent (removing the source-of-truth relation removes access, no fail-open), using a mechanism Phase 1 actually implements.

## Scenario

**Given** Bob is Alice's direct manager (`Relationship type='direct'`, Bob holding, Alice subject), granting Bob Reporting-line access including S5 (documents).

**When** that `Relationship` row is hard-deleted (simulating an orphaned/corrupted edge, not a normal reassignment).

**Then** Bob's access is gone on the next request — fail-closed (must not fail-open on stale/cached resolution).

**Preconditions:** [fixture](../README.md#canonical-personas); Bob holds a live `direct` Relationship over Alice; seeded certificate on Alice.

## Test 1 — baseline effective grant (live relationship)

- **inputURL:** `GET /users/<alice-id>/documents`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `documents` present; at least one item with `type` in `{cv, certificate}`

## Test 2 — after orphan

- **stateChange:** hard-delete Bob's `direct` Relationship row over Alice (not via the normal DELETE-then-POST reassignment flow — this simulates a corrupted/orphaned edge, e.g. a partial migration or manual data fix)

- **inputURL:** `GET /users/<alice-id>/documents`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; `documents` key absent — orphaned relationship fail-closed; no fail-open join
