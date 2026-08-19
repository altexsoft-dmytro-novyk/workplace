# AC-M-S11-01 · S11 Projects — Self: read

**Trace:** §3.2 S11 / Self `R` · §4.3
**Preconditions:** [fixture](../../README.md); Alice on Phoenix (PM Pete, DM Dave)

## Test

- **inputURL:** `GET /users/alice/sections/s11`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; project, PM, DM, period
