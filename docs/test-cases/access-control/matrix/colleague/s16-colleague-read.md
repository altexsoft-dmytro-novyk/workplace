# AC-M-S16-CO-R · colleague read s16

**Trace:** §3.2 S16 · AD-10

## Scenario

**Given** Colin is Alice's unrelated colleague.

**When** Colin reads Alice's Custom fields section.

**Then** the request succeeds and the section data is present in the response — the §3.2 colleague cell grants read. Per-field visibility may narrow the payload.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Custom fields data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/custom-fields`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `customfields` present; `colleagueVisibleField` present; `managementOnlyField` **absent**
