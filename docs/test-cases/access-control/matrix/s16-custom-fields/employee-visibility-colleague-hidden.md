# AC-M-S16-06 · S16 — *employee* visibility: still hidden from Colleague (negative)

**Trace:** §3.3.5
**Preconditions:** [fixture](../../README.md); custom field `t-shirt-size`, visibility *employee*, value set on Alice

## Test

- **inputURL:** `GET /users/alice/sections/s16`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** field absent from whatever the colleague view returns
