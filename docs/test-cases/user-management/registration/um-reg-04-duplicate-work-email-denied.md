# UM-REG-04 · Duplicate workEmail is rejected

**Trace:** [database-schema.md](../../../architecture/database-schema.md) `User.workEmail` (unique) · PRD FR-2 (`workEmail` is the magic-link login identity) · requirements §6 (identity across systems)

## Scenario

**Given** Root, holder of the HR Admin functional role, and Alice, an existing active user with `workEmail: alice@company.example`.

**When** Root submits a registration payload reusing Alice's address exactly.

**Then** the request is rejected with `409` and no second `User` row is created. `workEmail` is the account identity FR-2 sends every magic link to, so a second row on the same address would leave the login flow unable to name which account a link belongs to.

Scope is one probe: the exact-match duplicate. Whether a case or whitespace variant also conflicts depends on a normalization rule that is not yet decided, and whether a *deactivated* holder's address can be reused is likewise open — see the SPEC's open questions. Neither is asserted here, because a scenario that asserts an undecided rule manufactures false confidence in it.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded with `workEmail: alice@company.example` and `isActive: true`; no other user holds that address.

## Test

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": {
      "firstName": "Alicia",
      "lastName": "Duplicate",
      "position": "QA Engineer",
      "country": "Poland",
      "city": "Krakow",
      "workEmail": "alice@company.example",
      "companyJoinDate": "2026-09-01"
    }
  }
  ```
- **expectedResult:** `409`; the body reports a conflict on `workEmail` without echoing Alice's name, id, or any other field of the existing row.
- **stateChange:** stage 2 asserts against the datastore that exactly one row still holds that address and that Alice's fields are untouched. Story 1.1 has no read endpoint to observe this through.
