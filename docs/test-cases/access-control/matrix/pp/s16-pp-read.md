# AC-M-S16-PP-R · pp read s16

**Trace:** §3.2 S16 · AD-10

## Scenario

**Given** Paula is Alice's assigned people partner.

**When** Paula reads Alice's Custom fields section.

**Then** the request succeeds and the section data is present in the response — the §3.2 pp cell grants read. Per-field visibility may narrow the payload.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Custom fields data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/custom-fields`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Paula>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `customfields` present; at least one custom field key present
