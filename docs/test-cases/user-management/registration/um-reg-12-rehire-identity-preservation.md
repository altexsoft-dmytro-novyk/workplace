# UM-REG-12 · Rehire preserves existing User identity

**Trace:** [DEC-UM-009](../../../architecture/user-management-test-decisions.md) · epics.md Story 1.1 / future rehire workflow

## Scenario

**Given** Colin was deactivated and retains `workEmail: colin@company.example` on the existing `User` row.

**When** Root attempts `POST /users` with the same normalized email (simulating a mistaken "new hire" registration for a returning employee).

**Then** no second `User` row is created for that normalized email — identity and history stay on the original row.

**Note:** A dedicated rehire/reactivation endpoint is out of scope for this scenario. When that workflow lands, it must reuse Colin's existing `id`.

**Preconditions:** [fixture](../README.md#canonical-personas); Colin deactivated per `um-deact-01`.

## Test

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": {
      "firstName": "Colin",
      "lastName": "Return",
      "position": "Engineer",
      "country": "Poland",
      "city": "Warsaw",
      "workEmail": "colin@company.example",
      "companyJoinDate": "2026-09-01"
    }
  }
  ```
- **expectedResult:** `409` (or product-approved rehire rejection code); exactly one `User` row for normalized `colin@company.example`, still Colin's original `id`.
- **stateChange:** stage 2 asserts row count and id preservation in the datastore.
