# AC-UR-12 · Access roles cannot be created or widened through the role UI

**Trace:** §2.3 (access roles are not extensible this way) · AD-7 (AR policies seeded, no UI)

## Scenario

**Given** Root is the most privileged UI actor in the system.

**When** he tries to create a role that grants data visibility (an AR-shaped payload).

**Then** the role surface rejects it — it accepts feature permissions only; no API path creates or edits access-role policies.

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
      "title": "Super Viewer",
      "type": "AR",
      "permissions": [
        "read S6"
      ]
    }
  }
  ```
- **expectedResult:** `4xx` rejected — the role surface accepts §2.3 feature permissions only, even for HR Admin
