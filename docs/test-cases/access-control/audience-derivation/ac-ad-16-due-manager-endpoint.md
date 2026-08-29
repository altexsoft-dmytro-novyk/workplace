# AC-AD-16 · Due manager endpoint grants no audience

**Trace:** AD-20 · facade-contract.md (Due manager/PP endpoint)

## Scenario

**Given** Alice reports to **DueBob** whose departure is due, and Carol is above DueBob.

**When** Carol reads Alice's employment via Reporting line recursion.

**Then** the due manager endpoint grants **no** audience and cannot bridge Carol to Alice.

**Preconditions:** [fixture](../README.md#canonical-personas); DueBob due departure; Alice → DueBob → Carol.

## Test

- **inputURL:** `GET /users/<alice-id>/employment`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Carol>" },
    "body": {}
  }
  ```
- **expectedResult:** `404`; employment absent — due endpoint breaks walk
