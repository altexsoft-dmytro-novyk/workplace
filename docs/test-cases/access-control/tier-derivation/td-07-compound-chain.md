# AC-TD-07 · Compound chain: reports-to edge then project attachment

**Trace:** §2.1 transitive closure of two relations · AD-10 (one transitive graph)
**Preconditions:** [fixture](../README.md); Frank holds no direct relation to Alice or Phoenix

## Test

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:frank>"
    }
  }
  ```
- **expectedResult:** `200`; full Manager-line view — the walk composes Frank→Dave (reports-to) with Dave→Phoenix (DM policy) in one chain
