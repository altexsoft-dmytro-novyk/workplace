# UM-REG-11 · workEmail is normalized on write and lookup

**Trace:** [DEC-UM-007](../../../architecture/user-management-test-decisions.md) · epics.md FR-6

## Scenario

**Given** Colin exists with `workEmail: colin@company.example` (normalized storage).

**When** Root attempts to create or collide using whitespace or different casing variants of that address.

**Then** normalization applies before validation, storage, lookup, and uniqueness — duplicates resolve to `409`, not a second row.

**Preconditions:** [fixture](../README.md#canonical-personas); Colin seeded with normalized email.

## Test 1 — trim + lowercase on create collision

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": {
      "firstName": "Dup",
      "lastName": "Case",
      "position": "Engineer",
      "country": "Poland",
      "city": "Warsaw",
      "workEmail": "  COLIN@company.example  ",
      "companyJoinDate": "2026-09-01"
    }
  }
  ```
- **expectedResult:** `409`; no second `User` row.

## Test 2 — stored value is normalized (stage 2)

- **stateChange:** persisted `workEmail` for newly created users is trimmed and lowercased.
