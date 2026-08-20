# AC-FC-01 · Empty reportsTo grants nothing

**Trace:** AD-11/AD-12 (missing data yields less access, never more)

## Scenario

**Given** Eve exists in no relationship graph at all — no manager, no projects, no roles.

**When** she opens Alice's profile and the employee list.

**Then** she gets the least-privileged Colleague view everywhere; missing data never means more access.

**Preconditions:** [fixture](../README.md); Eve has no reportsTo edge, no projects, no policies, no PP assignments

## Test 1 — profile

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:eve>"
    }
  }
  ```
- **expectedResult:** `200`; Colleague view only

## Test 2 — list

- **inputURL:** `GET /users?columns=name,grade,riskLevel`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:eve>"
    }
  }
  ```
- **expectedResult:** `200`; colleague-whitelist columns only — a user the graph knows nothing about is the least-privileged user, not a special case
