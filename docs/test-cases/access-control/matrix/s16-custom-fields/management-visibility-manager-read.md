# AC-M-S16-01 · S16 — *management* visibility (default): Manager line reads it

**Trace:** §3.3.5
**Preconditions:** [fixture](../../README.md); custom field `visa-status`, visibility *management* (the default), value set on Alice

## Test

- **inputURL:** `GET /users/alice/sections/s16`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; `visa-status` present with value
