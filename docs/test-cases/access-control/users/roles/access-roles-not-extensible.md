# AC-UR-12 · Access roles cannot be created or widened through the role UI

**Trace:** §2.3 (access roles are not extensible this way) · AD-7 (AR policies seeded, no UI)
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
      "title": "Super Viewer",
      "type": "AR",
      "permissions": [
        "read S6"
      ]
    }
  }
  ```
- **expectedResult:** `4xx` rejected — the role surface accepts §2.3 feature permissions only; no API path creates or edits an `AR` policy, even for HR Admin
