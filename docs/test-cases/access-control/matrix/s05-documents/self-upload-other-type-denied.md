# AC-M-S05-04 · S5 Documents — Self: uploading non-certificate types denied

**Trace:** §3.2 S5 / Self (`+ upload certificates` only)

## Scenario

**Given** Alice can upload certificates.

**When** she tries to upload a document typed as a contract.

**Then** 403 — the Self write path accepts the certificate type only.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/documents`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:alice>"
    },
    "body": {
      "type": "contract",
      "file": "<multipart>"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; nothing created
