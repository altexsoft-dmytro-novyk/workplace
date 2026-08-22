# AC-UR-02 · Create role without the role-management permission

**Trace:** §2.2 HR Admin row (management of functional roles is HR Admin's)

## Scenario

**Given** Bob is a unit manager with a valid session but no role-management permission.

**When** he tries to create a functional role.

**Then** he gets 403 — a valid token without the permission is not enough.

**Preconditions:** [fixture](../../README.md); Bob holds no role-management permission (UM only)

## Test

- **inputURL:** `POST /roles`
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
- **expectedResult:** `403 Forbidden`; no role created
