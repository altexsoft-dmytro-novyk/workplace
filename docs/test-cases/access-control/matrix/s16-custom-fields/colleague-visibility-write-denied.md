# AC-M-S16-08 · S16 — *colleague* visibility grants read, never write

**Trace:** §3.3.5
**Preconditions:** [fixture](../../README.md); custom field `office-floor`, visibility *colleague*

## Test

- **inputURL:** `PATCH /users/alice/sections/s16`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "office-floor": "3"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
