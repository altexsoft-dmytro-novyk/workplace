# AC-M-S16-02 · S16 — *management* visibility: hidden from Self (negative)

**Trace:** §3.3.5 · §3.3.1
**Preconditions:** [fixture](../../README.md); custom field `visa-status`, visibility *management*, value set on Alice

## Test

- **inputURL:** `GET /users/alice/sections/s16`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; **no `visa-status` key** — not even the field name
