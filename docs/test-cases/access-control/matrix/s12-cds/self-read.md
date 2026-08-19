# AC-M-S12-01 · S12 CDS — Self: read

**Trace:** §3.2 S12 / Self `R (+ complete own IDP)` · §4.10
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
