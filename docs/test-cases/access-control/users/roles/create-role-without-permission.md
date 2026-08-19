# AC-UR-02 · Create role without the role-management permission

**Trace:** §2.2 HR Admin row (management of functional roles is HR Admin's)
**Preconditions:** [fixture](../../README.md); Bob holds no role-management permission (UM only)

## Test

- **inputURL:** `POST /users/roles`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "title": "IT Campaigns",
      "permissions": [
        "create form campaigns"
      ]
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; no role created — a valid token without the permission is not enough
