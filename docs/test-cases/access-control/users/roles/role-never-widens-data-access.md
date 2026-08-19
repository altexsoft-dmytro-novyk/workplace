# AC-UR-11 · A functional role never widens data access

**Trace:** §2.3 (new role sees its audience through the colleague view) · §2.2 (functional roles never grant data access)
**Preconditions:** [fixture](../../README.md); Ida holds role IT Campaigns; no Manager/PP relation to Alice

## Test

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:ida>"
    }
  }
  ```
- **expectedResult:** `200`; **Colleague** view only — the role changed nothing about data visibility
