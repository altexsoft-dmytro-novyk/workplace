# AC-UR-01 · Create role without authorization

**Trace:** §2.3 · global auth rule (README)

## Scenario

**Given** a request arrives with an empty authorization header.

**When** it tries to create a functional role.

**Then** authentication rejects it with 401 before any permission logic runs; nothing is created.

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
