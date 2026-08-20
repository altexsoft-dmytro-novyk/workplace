# AC-M-S16-05 · S16 — visibility grants read, never write

**Trace:** §3.3.5 (**assumption**: writes stay Manager/PP at every level)

## Scenario

**Given** Alice can see her `t-shirt-size` field.

**When** she tries to change its value.

**Then** 403 — visibility levels widen who reads a field; writing stays with managers and PP.

**Preconditions:** [fixture](../../README.md); custom field `t-shirt-size`, visibility *employee*

## Test

- **inputURL:** `PATCH /users/alice/sections/s16`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "t-shirt-size": "XL"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
