# AC-M-S12-07 · S12 CDS — PP: read

**Trace:** §3.2 S12 / PP `RW`

## Scenario

**Given** Paula is Alice's assigned People Partner.

**When** she requests Alice's CDS section.

**Then** she sees the full section.

**Preconditions:** [fixture](../../README.md)

**[Route note — not fully resolved]** `api-conventions.md` only fixes `assessments`/`idps` as separate collections; the `cds` context itself (and any skills-matrix-link endpoint) is still pending confirmation (spine Deferred). `GET /users/alice/assessments` below is a placeholder representative target — it does not actually return the matrix link or IDP data described in this scenario. Needs a real router decision once `cds` is confirmed; flag during developer approval.

## Test

- **inputURL:** `GET /users/alice/assessments`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; full CDS section
