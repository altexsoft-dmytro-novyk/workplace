# AC-M-S16-03 · S16 — *management* visibility: hidden from Colleague (negative)

**Trace:** §3.3.5 · §3.3.1
**Preconditions:** [fixture](../../README.md); custom field `visa-status`, visibility *management*, value set on Alice

## Test

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** `200`; no trace of the field anywhere in the body
