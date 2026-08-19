# AC-TD-01 · Self tier: employee resolves as Self on own profile

**Trace:** §2.1 Employee row · §3.1 Self
**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    }
  }
  ```
- **expectedResult:** `200`; Self view: sections per the Self column of §3.2; **no `s06` and no `s15` key anywhere in the body**
