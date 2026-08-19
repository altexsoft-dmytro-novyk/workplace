# AC-M-S11-07 · S11 Projects — Colleague: project name only (field-level negative)

**Trace:** §3.2 S11 / Colleague `R (project name only)` · §3.3.3
**Preconditions:** [fixture](../../README.md); Alice on Phoenix with PM, DM, period set

## Test

- **inputURL:** `GET /users/alice/sections/s11`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; each record contains the project **name only** — no `pm`, `dm`, or `period` keys in the payload
