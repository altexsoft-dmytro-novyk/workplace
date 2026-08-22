# AC-M-S12-09 · S12 CDS — Colleague: no read path (negative)

**Trace:** §3.2 S12 / Colleague `—` · §9 DoD

## Scenario

**Given** Alice's CDS data exists, and Colin is a plain colleague.

**When** Colin fetches her profile and probes the section.

**Then** no surface returns a trace of her assessments or IDPs.

**Preconditions:** [fixture](../../README.md); Alice's S12 populated

**[Route note — not fully resolved]** `api-conventions.md` only fixes `assessments`/`idps` as separate collections; the `cds` context itself (and any skills-matrix-link endpoint) is still pending confirmation (spine Deferred). Test 2's `GET /users/alice/assessments` is a placeholder representative target, not necessarily the only surface a real implementation would need to check. Needs a real router decision once `cds` is confirmed; flag during developer approval.

## Test 1 — profile assembly

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; no `s12` key

## Test 2 — direct request

- **inputURL:** `GET /users/alice/assessments`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `404`; no matrix link, assessments, or IDP data
