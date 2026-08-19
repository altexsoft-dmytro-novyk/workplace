# AC-UR-04 · Update role permissions without the role-management permission

**Trace:** §2.2 HR Admin row
**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/roles/it-campaigns/permissions`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:paula>"
    },
    "body": {
      "add": [
        "create action items"
      ]
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; permissions unchanged — PP has HR features, not role management
