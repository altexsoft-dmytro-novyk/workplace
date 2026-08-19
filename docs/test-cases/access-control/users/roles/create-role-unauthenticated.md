# AC-UR-01 · Create role without authorization

**Trace:** §2.3 · global auth rule (README)
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/roles`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": ""
    },
    "body": {
      "title": "IT Campaigns",
      "permissions": [
        "create form campaigns"
      ]
    }
  }
  ```
- **expectedResult:** `401 Unauthorized`; no role created
