# AC-M-S7-SE-R · self read s7

**Trace:** §3.2 S7 · AD-10

## Scenario

**Given** Alice is Alice's Self.

**When** Alice reads Alice's Management notes section.

**Then** the request succeeds and the section data is present in the response — the §3.2 self cell grants read. Record-flag projection applies within the allowed section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Management notes data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/notes`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `notes` present; note `0195f100-0000-7000-8000-000000000501` present in items; note `0195f100-0000-7000-8000-000000000502` **absent**
