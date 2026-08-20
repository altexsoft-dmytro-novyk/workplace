# AC-M-S16-04 · S16 — *employee* visibility: Self reads it

**Trace:** §3.3.5 (*employee* — also visible to Self)

## Scenario

**Given** the custom field `t-shirt-size` carries *employee* visibility and Alice has a value.

**When** she requests her own custom fields.

**Then** she sees the field with its value — employee visibility adds Self to the audience.

**Preconditions:** [fixture](../../README.md); custom field `t-shirt-size`, visibility *employee*, value set on Alice

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
- **expectedResult:** `200`; `t-shirt-size` present with value
