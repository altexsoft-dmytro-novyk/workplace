# UM-REG-15 · An incomplete or out-of-range birthday is rejected

**Trace:** [database-schema.md](../../../architecture/database-schema.md) `User.birthDay`/`User.birthMonth` ("1-31" / "1-12, paired with birthDay — both null together or both set together") · PRD Data Model — User entity

## Scenario

**Given** Root, holder of the HR Admin functional role and fully entitled to create users.

**When** Root submits a payload where `birthDay`/`birthMonth` are only partially supplied, or where either value falls outside its valid range.

**Then** the request is rejected with `400` naming the offending field, and no `User` row is created. `birthDay`/`birthMonth` are individually nullable, but neither may be supplied without the other, and each has its own bound (`birthDay` 1-31, `birthMonth` 1-12) — a partial pair or an out-of-range value both leave the record in a state the schema doesn't allow, the same way a malformed `workEmail` (`um-reg-09`) is a present-but-invalid value rather than an absent one (`um-reg-06`).

Every other field is valid deliberately, so `400` can only be the answer to the birthday input under test in each block.

**Preconditions:** [fixture](../README.md#canonical-personas); Root seeded with the HR Admin functional role.

## Test

- **Test 1 — `birthDay` without `birthMonth`**
  - **inputURL:** `POST /users`
  - **inputRequest:** body per `um-reg-01`'s valid shape, plus `"birthDay": 15` and no `birthMonth` key.
  - **expectedResult:** `400`; error names `birthMonth`. No row created.
- **Test 2 — `birthMonth` without `birthDay`**
  - **inputURL:** `POST /users`
  - **inputRequest:** body per `um-reg-01`'s valid shape, plus `"birthMonth": 3` and no `birthDay` key.
  - **expectedResult:** `400`; error names `birthDay`. No row created.
- **Test 3 — `birthDay` out of range**
  - **inputURL:** `POST /users`
  - **inputRequest:** body per `um-reg-01`'s valid shape, plus `"birthDay": 32, "birthMonth": 3`.
  - **expectedResult:** `400`; error names `birthDay`. No row created.
- **Test 4 — `birthMonth` out of range**
  - **inputURL:** `POST /users`
  - **inputRequest:** body per `um-reg-01`'s valid shape, plus `"birthDay": 15, "birthMonth": 13`.
  - **expectedResult:** `400`; error names `birthMonth`. No row created.
- **stateChange:** stage 2 asserts against the datastore that no row was written for any of the four sub-cases. Story 1.1 has no read endpoint to observe this through.
