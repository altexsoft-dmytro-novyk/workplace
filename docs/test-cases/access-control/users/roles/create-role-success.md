# AC-UR-03 · Create role at runtime — no deploy, no schema change

**Trace:** §2.3 (roles are data, created through the UI by HR Admin)

## Scenario

**Given** Root holds the HR Admin role, which carries role management.

**When** Root creates a new role named IT Campaigns with a single permission.

**Then** the role exists immediately in the running system and is assignable — no deploy, no schema change.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /roles`
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
- **expectedResult:** `201`; role exists with exactly that permission, immediately assignable
