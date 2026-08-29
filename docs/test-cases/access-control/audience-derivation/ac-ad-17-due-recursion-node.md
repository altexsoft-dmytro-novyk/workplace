# AC-AD-17 · Due intermediate node stops recursion

**Trace:** AD-20 · facade-contract.md (Due recursion node)

## Scenario

**Given** Alice reports to **DueMid** (due departure) who reports to Carol.

**When** Carol attempts Reporting line access to Alice.

**Then** traversal stops at the due node — Carol does not inherit access **through** DueMid.

**Preconditions:** [fixture](../README.md#canonical-personas); DueMid due; Alice → DueMid → Carol.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Carol>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; employment absent
