# AC-M-S11-01 · S11 Projects — Self: read

**Trace:** §3.2 S11 / Self `R` · §4.3

## Scenario

**Given** Alice works on Phoenix under PM Pete and DM Dave.

**When** she requests her projects section (S11).

**Then** she sees the project with its PM, DM and period.

**Preconditions:** [fixture](../../README.md); Alice on Phoenix (PM Pete, DM Dave)

## Test

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; project, PM, DM, period
