# UM-REG-07 · Duplicate ttId on create is rejected

**Trace:** [database-schema.md](../../../architecture/database-schema.md) `User.ttId` (nullable, unique) · AD-13 (external identity placeholder) · requirements §6 (email alone is not sufficient identity across systems)

## Scenario

**Given** Root, holder of the HR Admin functional role, and Colin, an existing user already carrying `ttId: "tt-1042"`.

**When** Root registers a new hire whose payload reuses that `ttId`.

**Then** the request is rejected with `409` and no `User` row is created; Colin's record is untouched. `ttId` is the external-identity key a future timetracker sync resolves against (AD-13), so two rows sharing one `ttId` would make that resolution ambiguous — the sync could attribute one external identity's data to either person.

This closes the uniqueness half that registration previously left to the profile suite: `um-pf-04` proves the constraint holds on **edit**, this case proves it holds on **create**. A constraint enforced on only one of the two write paths is not enforced.

**Preconditions:** [fixture](../README.md#canonical-personas); Colin seeded with `ttId: "tt-1042"`; no user with `workEmail: nina.volkova@company.example`.

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
      "workEmail": "nina.volkova@company.example",
      "companyJoinDate": "2026-09-01",
      "ttId": "tt-1042"
    }
  }
  ```
- **expectedResult:** `409`; the body reports a conflict on `ttId` without echoing Colin's name, id, or any other field. `workEmail` here is unique and unused, so the conflict can only be the `ttId`.
- **stateChange:** stage 2 asserts against the datastore that exactly one row holds `tt-1042` and that no row exists for `nina.volkova@company.example`. Story 1.1 has no read endpoint to observe this through.
