# UM-REG-09 · Create with a malformed workEmail is rejected

**Trace:** PRD FR-2 (`workEmail` is the address every magic link is sent to) · [database-schema.md](../../../architecture/database-schema.md) `User.workEmail`

## Scenario

**Given** Root, holder of the HR Admin functional role and fully entitled to create users.

**When** Root submits a payload whose `workEmail` is not a valid address, with every other required field present and valid.

**Then** the request is rejected with `400` naming `workEmail`, and no `User` row is created. This is a separate requirement from the missing-field check in `UM-REG-06`: a present-but-invalid value is not an absent one, and it fails for a reason beyond storage. `workEmail` is the sole delivery target for the magic link that FR-2 makes the only way to log in, so an undeliverable address produces an account nobody can ever sign into and no password path to fall back on.

Every other field is valid deliberately, so `400` can only be the answer to `workEmail`.

**Preconditions:** [fixture](../README.md#canonical-personas); Root seeded with the HR Admin functional role.

## Test

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": {
      "firstName": "Nina",
      "lastName": "Volkova",
      "position": "QA Engineer",
      "country": "Poland",
      "city": "Krakow",
      "workEmail": "nina.volkova-at-company",
      "companyJoinDate": "2026-09-01"
    }
  }
  ```
- **expectedResult:** `400`; the error names `workEmail` and no other field.
- **stateChange:** stage 2 asserts against the datastore that no row was written. Story 1.1 has no read endpoint to observe this through.
