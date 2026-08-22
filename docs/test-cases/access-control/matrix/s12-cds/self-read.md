# AC-M-S12-01 · S12 CDS — Self: read

**Trace:** §3.2 S12 / Self `R (+ complete own IDP)` · §4.10

## Scenario

**Given** Alice's CDS section holds her department's matrix link, a past assessment with its conclusion, and an open IDP.

**When** she requests the section.

**Then** she sees it all — the matrix link resolved for her department and position, the assessment log, and her IDP with its deadline.

**Preconditions:** [fixture](../../README.md); S12 holds matrix link, one assessment record, one open IDP

**[Route note — not fully resolved]** `api-conventions.md` only fixes `assessments`/`idps` as separate collections; the `cds` context itself (and any skills-matrix-link endpoint) is still pending confirmation (spine Deferred). `GET /users/alice/assessments` below is a placeholder representative target — it does not actually return the matrix link or IDP data described in this scenario. Needs a real router decision once `cds` is confirmed; flag during developer approval.

## Test

- **inputURL:** `GET /users/alice/assessments`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; current skills-matrix link (resolved for her department+position), assessment log with conclusions, IDP with deadline
