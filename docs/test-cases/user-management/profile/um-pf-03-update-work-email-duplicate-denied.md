# UM-PF-03 · Editing workEmail to an address already in use is rejected

**Trace:** database-schema.md `User.workEmail` (unique) · requirements §3.2 S1 (Manager line: RW)

## Scenario

**Given** Bob, Alice's unit manager, and Colin, an existing user with `workEmail: colin@company.example`.

**When** Bob attempts to change Alice's `workEmail` to Colin's address.

**Then** the write is rejected on the uniqueness constraint; Alice's `workEmail` is unchanged.

**Preconditions:** [fixture](../README.md#canonical-personas); Colin seeded with `workEmail: colin@company.example`.

## Test

- **inputURL:** `PATCH /users/<aliceId>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": { "workEmail": "colin@company.example" }
  }
  ```
- **expectedResult:** `409`; a follow-up `GET /users/<aliceId>` shows Alice's original `workEmail` unchanged.
