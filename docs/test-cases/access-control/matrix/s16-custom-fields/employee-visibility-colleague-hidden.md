# AC-M-S16-06 · S16 — *employee* visibility: still hidden from Colleague (negative)

**Trace:** §3.3.5

## Scenario

**Given** the employee-visibility field `t-shirt-size` has a value on Alice.

**When** Colin requests her custom fields.

**Then** the field is absent — employee visibility adds Self, not colleagues.

**Preconditions:** [fixture](../../README.md); custom field `t-shirt-size`, visibility *employee*, value set on Alice

## Test

- **inputURL:** `GET /users/alice/custom-fields`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    }
  }
  ```
- **expectedResult:** field absent from whatever the colleague view returns
