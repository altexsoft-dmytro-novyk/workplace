# AC-UR-05 · Assign a person to a role without the role-management permission

**Trace:** §2.2 HR Admin row (no self-service role grants)

## Scenario

**Given** Bob holds no role-management permission.

**When** he tries to add himself to the IT Campaigns role.

**Then** he gets 403 — there are no self-service role grants.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/roles/it-campaigns/members`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "userId": "bob"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; membership unchanged
