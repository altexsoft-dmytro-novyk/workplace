# AC-M-S12-01 · S12 CDS — Self: read

**Trace:** §3.2 S12 / Self `R (+ complete own IDP)` · §4.10

## Scenario

**Given** Alice's CDS section holds her department's matrix link, a past assessment with its conclusion, and an open IDP.

**When** she requests the section.

**Then** she sees it all — the matrix link resolved for her department and position, the assessment log, and her IDP with its deadline.

**Preconditions:** [fixture](../../README.md); S12 holds matrix link, one assessment record, one open IDP

## Test

- **inputURL:** `GET /users/alice/sections/s12`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; current skills-matrix link (resolved for her department+position), assessment log with conclusions, IDP with deadline
