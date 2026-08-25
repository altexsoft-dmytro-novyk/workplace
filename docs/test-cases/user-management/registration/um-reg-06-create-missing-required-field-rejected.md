# UM-REG-06 · Create with a missing non-nullable field is rejected

**Trace:** [database-schema.md](../../../architecture/database-schema.md) `User` (non-nullable S1 columns) · PRD Data Model — `User` entity · requirements §3.2 (S1 identity card)

## Scenario

**Given** Root, holder of the HR Admin functional role and fully entitled to create users.

**When** Root submits a payload omitting non-nullable S1 columns.

**Then** the request is rejected with `400` at the request boundary and no `User` row is created. Entitlement is not the question — Root has it; the payload cannot produce a valid row. `firstName`, `lastName`, `position`, `country`, `city`, `workEmail`, and `companyJoinDate` are all non-nullable in the schema, so a create missing any of them has no valid outcome.

A `500` surfacing a database constraint violation is a failure of this case, not a pass: the rejection belongs at validation, where the caller learns which fields are missing.

**Preconditions:** [fixture](../README.md#canonical-personas); Root seeded with the HR Admin functional role; no user with `workEmail: nina.volkova@company.example`.

## Test

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": {
      "firstName": "Nina",
      "lastName": "Volkova",
      "workEmail": "nina.volkova@company.example"
    }
  }
  ```
- **expectedResult:** `400`; the error names the missing fields (`position`, `country`, `city`, `companyJoinDate`). Not `201` with invented defaults, and not `500` from a database constraint.
- **stateChange:** stage 2 asserts against the datastore that no partial row was written. Story 1.1 has no read endpoint to observe this through.
