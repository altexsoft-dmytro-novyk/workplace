# AC-M-S16-COLLEAGUE · S16 field visibility (colleague)

**Trace:** §3.3.6 · S16

## Scenario

**Given** Colin reads Alice's custom fields and `colleagueVisibleField` has visibility *colleague*.

**When** Colin GETs custom fields.

**Then** the field is present for this visibility level.

**Preconditions:** [fixture](../README.md#canonical-personas); seeded custom field definitions per visibility.

## Test

- **inputURL:** `GET /users/<alice-id>/custom-fields`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `colleagueVisibleField` present when visibility allows
