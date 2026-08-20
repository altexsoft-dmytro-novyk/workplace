# AC-M-S05-06 · S5 Documents — Manager line: write denied

**Trace:** §3.2 S5 / Manager line `R`

## Scenario

**Given** Dave can read Alice's documents.

**When** he tries to upload one for her.

**Then** 403 — only the PP (and Alice, certificates only) writes S5.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/documents`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:dave>"
    },
    "body": {
      "type": "certificate",
      "file": "<multipart>"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; nothing created
