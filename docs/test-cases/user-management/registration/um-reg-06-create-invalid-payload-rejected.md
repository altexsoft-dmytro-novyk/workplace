# UM-REG-06 · Invalid registration payload is rejected

**Trace:** [database-schema.md](../../../architecture/database-schema.md) `User` (non-nullable S1 columns) · PRD Data Model — `User` entity · PRD FR-2 (`workEmail` is the magic-link delivery target)

## Scenario

**Given** Root, holder of the HR Admin functional role and fully entitled to create users.

**When** Root submits a payload that omits a non-nullable S1 column, or one whose `workEmail` is not a valid address.

**Then** the request is rejected with `400` and no `User` row is created. Entitlement is not the question here — Root has it; the payload itself cannot produce a valid row. `firstName`, `lastName`, `position`, `country`, `city`, `workEmail`, and `companyJoinDate` are all non-nullable in the schema, so a create missing any of them has no valid outcome. A malformed `workEmail` is rejected for a second reason beyond storage: it is the address FR-2 sends every login link to, so an undeliverable value produces an account nobody can ever sign into.

**Preconditions:** [fixture](../README.md#canonical-personas); Root seeded with the HR Admin functional role; no user with `workEmail: nina.volkova@company.example`.

## Test 1 — missing non-nullable fields

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
- **expectedResult:** `400`; the error names the missing fields (`position`, `country`, `city`, `companyJoinDate`). Not `201` with defaults invented for them, and not `500` from a database constraint — the rejection happens at the request boundary.

## Test 2 — malformed workEmail

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
- **expectedResult:** `400`; the error names `workEmail`.

## Test 3 — observe that nothing was created

- **inputURL:** `GET /users?filter[lastName]=Volkova`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" }
  }
  ```
- **expectedResult:** `200` with an empty result set — neither rejected attempt left a partial row.
