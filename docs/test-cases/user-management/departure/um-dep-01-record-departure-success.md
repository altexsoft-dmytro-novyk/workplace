# UM-DEP-01 · Holder of the dedicated permission records a future departure

**Trace:** epics.md Story 5.1 · FR-6 · spine AD-15

## Scenario

**Given** Colin manages nobody, manages no department, and is nobody's People Partner, and Root holds the *record a departure* permission.

**When** Root submits `POST /users/<colinId>/departure` with `{ effectiveDate: <a future date>, reason: 'resignation' }`.

**Then** the response is `201`, a `Departure` row is stored (`userId: colinId`, `effectiveDate`, `reason: 'resignation'`, `recordedBy: rootId`, `appliedAt: null`), and Colin's current employment status is unaffected before that date (§4.16: scheduling never flips current status early).

**Preconditions:** [fixture](../README.md#canonical-personas); Colin holds no `Relationship` as holder and manages no `Department`.

## Test

- **Test 1 — the recording**
  - **inputURL:** `POST /users/<colinId>/departure`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:Root>" },
      "body": { "effectiveDate": "2099-01-01", "reason": "resignation" }
    }
    ```
  - **expectedResult:** `201`; body includes `userId: "<colinId>"`, `reason: "resignation"`, `appliedAt: null`.
- **Test 2 — current status unaffected before the effective date**
  - **inputURL:** `GET /users/<colinId>/employment`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; `employmentStatus: "active"`.
