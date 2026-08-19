# AC-FC-02 · Orphaned policy row grants zero access

**Trace:** AD-11 (dangling `targetId` joins to zero members → zero grants)
**Preconditions:** [fixture](../README.md); Dave is DM of Phoenix (policy attachment), Alice works on Phoenix

## Test 1 — baseline: Manager view via the policy

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200`; full Manager-line view (AC-TD-05)

## Test 2 — state change

- **stateChange:** project Phoenix is deleted (sync/admin data operation); Dave's `manages-project(Phoenix)` policy row is deliberately left dangling

## Test 3 — dangling policy grants nothing

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200`; **Colleague** view — the orphaned policy resolves to no members; no error, no fallback to wider access
