# AC-TD-05 · Manager tier via DM project attachment

**Trace:** §2.1 relation 2, consequence 2 (project assignment grants managerial access)
**Preconditions:** [fixture](../README.md); no reports-to path Dave→Alice; access rides only on the DM-of-Phoenix policy

## Test

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200`; full Manager-line view — same section set as Alice's unit manager receives (AC-TD-03)
