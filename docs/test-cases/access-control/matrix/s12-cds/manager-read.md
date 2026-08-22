# AC-M-S12-04 · S12 CDS — Manager line: read

**Trace:** §3.2 S12 / Manager line `RW` · §4.10

## Scenario

**Given** Bob is Alice's unit manager.

**When** he requests her CDS section.

**Then** he sees the full section — matrix link, assessments, IDPs.

**Preconditions:** [fixture](../../README.md)

**[Route note — not fully resolved]** `api-conventions.md` only fixes `assessments`/`idps` as separate collections; the `cds` context itself (and any skills-matrix-link endpoint) is still pending confirmation (spine Deferred). `GET /users/alice/assessments` below is a placeholder representative target — it does not actually return the matrix link or IDP data described in this scenario. Needs a real router decision once `cds` is confirmed; flag during developer approval.

## Test

- **inputURL:** `GET /users/alice/assessments`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; full CDS section
