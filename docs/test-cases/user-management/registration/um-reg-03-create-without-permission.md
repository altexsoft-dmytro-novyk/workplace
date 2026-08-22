# UM-REG-03 · Create user without the HR Admin permission

**Trace:** PRD FR-1 · requirements §2.3 (functional-role-gated features)

## Scenario

**Given** Colin, an authenticated employee holding no functional role that grants user creation.

**When** Colin attempts to create a new user.

**Then** the request is denied — creating a user is an HR-Admin-gated feature, not something any authenticated employee can do.

**Preconditions:** [fixture](../README.md#canonical-personas); Colin holds no functional role.

## Test

- **inputURL:** `POST /users`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": {
      "firstName": "Nina",
      "lastName": "Volkova",
      "workEmail": "nina.volkova@company.example"
    }
  }
  ```
- **expectedResult:** `403`; no `User` record created.
