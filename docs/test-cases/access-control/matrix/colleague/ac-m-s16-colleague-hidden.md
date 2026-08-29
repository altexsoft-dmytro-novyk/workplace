# AC-M-S16-COLLEAGUE-HIDDEN · S16 field visibility (colleague-hidden)

**Trace:** §3.3.6 · S16

## Scenario

**Given** Colin reads Alice's custom fields and `managementOnlyField` has visibility *management*.

**When** Colin GETs custom fields.

**Then** the management-only field is absent while colleague-visible fields remain (§3.3.6).

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
- **expectedResult:** `200`; `managementOnlyField` **absent**; `colleagueVisibleField` present — colleague cannot infer management-only value
