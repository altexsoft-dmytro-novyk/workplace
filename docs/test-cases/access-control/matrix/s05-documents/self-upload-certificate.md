# AC-M-S05-03 · S5 Documents — Self: certificate upload allowed

**Trace:** §3.2 S5 / Self `+ upload certificates` · §4.3

## Scenario

**Given** Alice finished a course and got a certificate.

**When** she uploads it to her own documents.

**Then** it lands in her S5 — certificate upload is the one Self write in this section.

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
      "type": "certificate",
      "file": "<multipart>"
    }
  }
  ```
- **expectedResult:** `201`; appears in her S5
