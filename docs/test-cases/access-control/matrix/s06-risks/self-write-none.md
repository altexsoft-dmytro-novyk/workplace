# AC-M-S06-02 · S6 Risks — Self: no write path (negative)

**Trace:** §3.2 S6 / Self `—` · §9 DoD

## Scenario

**Given** Alice cannot see her own risk section.

**When** she tries to create a risk record about herself.

**Then** 404 — for her the section does not exist in either direction.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/risks`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "level": "low",
      "description": "all fine"
    }
  }
  ```
- **expectedResult:** `404`; nothing created
