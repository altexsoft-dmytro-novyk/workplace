# AC-UR-04 · Update role permissions without the role-management permission

**Trace:** §2.2 HR Admin row

## Scenario

**Given** Paula is a People Partner — she has HR features, but not role management.

**When** she tries to add a permission to an existing role.

**Then** she gets 403 and the role's permissions are unchanged.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /roles/it-campaigns/permissions`
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
- **expectedResult:** `403 Forbidden`; permissions unchanged
