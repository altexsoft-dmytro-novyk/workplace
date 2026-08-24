# UM-REG-08 · Concurrent creates on one workEmail yield a single user

**Trace:** [database-schema.md](../../../architecture/database-schema.md) `User.workEmail` (unique) · PRD FR-2 (`workEmail` is the magic-link login identity) · AD-5 (persistence lives in `infrastructure/`, so the constraint is the arbiter)

## Scenario

**Given** Root, holder of the HR Admin functional role, and no existing user carrying Nina's `workEmail`.

**When** two registration requests for that same address are submitted concurrently, so both pass any pre-insert uniqueness check before either commits.

**Then** exactly one succeeds with `201` and the other is rejected with `409`; exactly one `User` row exists for the address afterwards. Which of the two wins is not asserted — the ordering is a race and either outcome is correct.

`UM-REG-04` cannot reach this path. A sequential duplicate is caught by the application's own uniqueness read, so it never exercises what happens when two writers clear that read together and the database constraint becomes the only thing standing between them and two rows. This case is why the constraint must exist in the migration rather than the check living only in the domain service.

The `409` must come from mapping the unique-violation error the driver raises. An unmapped violation surfaces as `500`, which is a defect here: the data stays correct but the caller is told the system broke rather than that the address is taken.

**Preconditions:** [fixture](../README.md#canonical-personas); Root seeded with the HR Admin functional role; no user with `workEmail: nina.volkova@company.example`.

## Test

- **inputURL:** `POST /users` ×2, issued concurrently and not awaited in sequence
- **inputRequest:** both requests carry an identical payload:
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
      "companyJoinDate": "2026-09-01"
    }
  }
  ```
- **expectedResult:** the two responses are exactly one `201` and one `409`, in either order. Never two `201`s, and never a `500`.
- **stateChange:** stage 2 asserts against the datastore that exactly one row exists for that address. Story 1.1 has no read endpoint to observe this through.
