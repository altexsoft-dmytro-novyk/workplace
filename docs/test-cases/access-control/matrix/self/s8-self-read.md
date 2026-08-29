# AC-M-S8-SE-R · self read s8

**Trace:** §3.2 S8 · AD-10

## Scenario

**Given** Alice is Alice's Self.

**When** Alice reads Alice's Feedbacks section.

**Then** the request succeeds and the section data is present in the response — the §3.2 self cell grants read. Record-flag projection applies within the allowed section.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Feedbacks data for Alice.

## Test

- **inputURL:** `GET /users/<alice-id>/feedbacks`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; `feedbacks` present; feedback `0195f100-0000-7000-8000-000000000601` present in items; feedback `0195f100-0000-7000-8000-000000000602` **absent**
