# UM-REG-04 · Duplicate workEmail is rejected

**Trace:** database-schema.md `User.workEmail` (unique) · requirements §6 (identity across systems — email is part of, not the whole of, identity, but must still be unique per account)

## Scenario

**Given** Root, holder of the HR Admin functional role, and Alice, an existing user with `workEmail: alice@company.example`.

**When** Root submits a registration form reusing Alice's `workEmail`.

**Then** the request is rejected on the uniqueness constraint and no second `User` row is created — `workEmail` is the account identity (FR-2's magic-link target) and must stay unique.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice already seeded with `workEmail: alice@company.example`.

## Test

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": {
      "firstName": "Alicia",
      "lastName": "Duplicate",
      "workEmail": "alice@company.example"
    }
  }
  ```
- **expectedResult:** `409`; no new `User` record created; existing Alice record unchanged.
