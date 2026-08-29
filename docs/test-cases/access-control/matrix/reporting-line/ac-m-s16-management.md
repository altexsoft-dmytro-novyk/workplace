# AC-M-S16-MANAGEMENT · S16 field visibility (management)

**Trace:** §3.3.6 · S16

## Scenario

**Given** Bob reads Alice's custom fields and `managementOnlyField` has visibility *management*.

**When** Bob GETs custom fields.

**Then** the field is present for this visibility level.

**Preconditions:** [fixture](../README.md#canonical-personas); seeded custom field definitions per visibility.

## Test

- **inputURL:** `GET /users/<alice-id>/custom-fields`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `managementOnlyField` present when visibility allows
