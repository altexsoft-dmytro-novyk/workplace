# AC-M-S16-EMPLOYEE · S16 field visibility (employee)

**Trace:** §3.3.6 · S16

## Scenario

**Given** Alice reads Alice's custom fields and `employeeVisibleField` has visibility *employee*.

**When** Alice GETs custom fields.

**Then** the field is present for this visibility level.

**Preconditions:** [fixture](../README.md#canonical-personas); seeded custom field definitions per visibility.

## Test

- **inputURL:** `GET /users/<alice-id>/custom-fields`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `employeeVisibleField` present when visibility allows
