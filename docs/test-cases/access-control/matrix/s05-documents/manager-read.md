# AC-M-S05-05 · S5 Documents — Manager line: read

**Trace:** §3.2 S5 / Manager line `R` (Dave: project path)

## Scenario

**Given** Dave is a Manager of Alice via his DM role on her project.

**When** he requests her documents.

**Then** he can read the list — Manager line holds R on S5.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `GET /users/alice/documents`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    }
  }
  ```
- **expectedResult:** `200`; document list
