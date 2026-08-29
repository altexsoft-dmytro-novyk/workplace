# AC-M-S7-PP-R · pp read s7

**Trace:** §3.2 S7 · AD-10

## Scenario

**Given** Paula is Alice's assigned people partner.

**When** Paula reads Alice's Management notes section.

**Then** the request succeeds and the section data is present in the response — the §3.2 pp cell grants read. Record-flag projection applies within the allowed section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Management notes data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/notes`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Paula>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `notes` present; `notes` section data present
