# UM-REL-07 · Non-HR Admin cannot mutate relationships

**Trace:** epics.md Stories 4.1 and 4.2 · FR-14/FR-15

## Scenario

**Given** Colin holds no HR Admin functional role.

**When** Colin attempts to create a reports-to or mentorship relationship for Alice.

**Then** the request is denied with `403`.

**Note (temporary rule, epics.md Story 4.2):** Test 2's mentorship gate is HR-Admin-only as a **temporary product simplification**, not the sourced rule — §4.11 assigns pair/unpair authority to "manager and PP," and §2.3 lists "assign mentors" as an independently grantable permission, neither HR-Admin-exclusive. This case must be revisited once the AD-7 policies engine and the AD-10 Manager-line walk are wired into `AccessControl`, at which point Colin (or a UM/PP outside their own Manager-line/PP relationship to Alice) remains correctly denied, but a UM/PP *with* that relationship should no longer be. Test 1 (reports-to) is not affected — HR-Admin-only there is the sourced, non-temporary rule.

**Preconditions:** [fixture](../README.md#canonical-personas).

## Test 1 — reports-to denied

- **inputURL:** `POST /users/<aliceId>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": { "type": "direct", "targetId": "<bobId>" }
  }
  ```
- **expectedResult:** `403`.

## Test 2 — mentorship denied

- **inputURL:** `POST /users/<aliceId>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": { "type": "mentorship", "targetId": "<paulaId>" }
  }
  ```
- **expectedResult:** `403`.
