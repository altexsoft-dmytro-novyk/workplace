# AC-UR-03 · Create role at runtime — no deploy, no schema change

**Trace:** §2.3 (roles are data, created through the UI by HR Admin)
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/roles`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:root>"
    },
    "body": {
      "title": "IT Campaigns",
      "permissions": [
        "create form campaigns"
      ]
    }
  }
  ```
- **expectedResult:** `201`; role exists with exactly that permission, immediately assignable — against the running system
