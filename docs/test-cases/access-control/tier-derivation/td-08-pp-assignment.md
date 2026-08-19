# AC-TD-08 · People Partner tier via assignment

**Trace:** §2.1 People Partner row · §3.1 PP
**Preconditions:** [fixture](../README.md); Paula has no reports-to path to Alice and none of her projects

## Test

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    }
  }
  ```
- **expectedResult:** `200`; PP view: every section of the §3.2 PP column, incl. S7 regardless of flags
