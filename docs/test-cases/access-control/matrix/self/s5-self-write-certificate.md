# AC-M-S5-SE-W-WRITECERTIFICATE · self upload own certificate

**Trace:** §3.2 S5 · §4.3 · AD-10

## Scenario

**Given** Alice is Self on her Documents section (§3.2 `R` plus §4.3 certificate upload).

**When** Alice uploads a certificate document.

**Then** the upload succeeds — Self may upload certificates but not other document types.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Documents data for Alice.

## Test

- **inputURL:** `POST /users/<alice-id>/documents`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {
  "type": "certificate",
  "title": "AWS Solutions Architect"
}
  }
  ```
- **expectedResult:** `201`; certificate document persisted with `type: certificate`
