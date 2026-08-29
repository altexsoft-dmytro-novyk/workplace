# AC-M-S2-SE-R · self read s2

**Trace:** §3.2 S2 · AD-10

## Scenario

**Given** Alice is Alice's Self.

**When** Alice reads Alice's Personal contacts section.

**Then** the request succeeds and the section data is present in the response — the §3.2 self cell grants read.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Personal contacts data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/personal-contacts`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `personalcontacts` present; `personalPhone` or `residentialAddress` present
