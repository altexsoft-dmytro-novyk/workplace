# AC-M-S09-01 · S9 Career timeline — Self: read

**Trace:** §3.2 S9 / Self `R` · §4.3
**Preconditions:** [fixture](../../README.md); timeline holds system events (join, grade change) and a manual entry

## Test

- **inputURL:** `GET /users/alice/sections/s09`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; all events, typed and dated — system-generated and manual alike
