# AC-M-S05-10 · S5 Documents — Colleague: no write path (negative)

**Trace:** §3.2 S5 / Colleague `—` · §9 DoD

## Scenario

**Given** Colin cannot even see Alice's documents.

**When** he tries to upload one for her.

**Then** 404 — for him the section does not exist.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/documents`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "type": "certificate",
      "file": "<multipart>"
    }
  }
  ```
- **expectedResult:** `404`; nothing created
