# AC-M-S16-02 · S16 — *management* visibility: hidden from Self (negative)

**Trace:** §3.3.5 · §3.3.1

## Scenario

**Given** the management-visibility field `visa-status` has a value on Alice.

**When** Alice requests her own custom fields.

**Then** the field is absent — not even its name appears; management visibility excludes the employee.

**Preconditions:** [fixture](../../README.md); custom field `visa-status`, visibility *management*, value set on Alice

## Test

- **inputURL:** `GET /users/alice/custom-fields`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; **no `visa-status` key** — not even the field name
