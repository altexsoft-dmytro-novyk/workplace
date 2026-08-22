# AC-M-S16-01 · S16 — *management* visibility (default): Manager line reads it

**Trace:** §3.3.5

## Scenario

**Given** HR defined a custom field `visa-status` with the default *management* visibility, and Alice has a value.

**When** Bob, her unit manager, requests her custom fields.

**Then** he sees the field with its value — management visibility is exactly the Manager/PP audience.

**Preconditions:** [fixture](../../README.md); custom field `visa-status`, visibility *management* (the default), value set on Alice

## Test

- **inputURL:** `GET /users/alice/custom-fields`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; `visa-status` present with value
