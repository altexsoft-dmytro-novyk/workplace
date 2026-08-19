# AC-M-S11-05 · S11 Projects — PP: read

**Trace:** §3.2 S11 / PP `R`
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/sections/s11`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; project, PM, DM, period
