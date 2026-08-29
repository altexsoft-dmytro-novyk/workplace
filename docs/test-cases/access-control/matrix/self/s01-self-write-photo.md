# AC-M-S01-SELF-W-PHOTO · Self uploads own photo

**Trace:** §3.2 S1 · Self photo RW

## Scenario

**Given** Alice views her own identity card where only **photo** is Self-writable.

**When** Alice uploads a new photo.

**Then** the upload succeeds — distinct from identity-field PATCH.

**Preconditions:** [fixture](../README.md#canonical-personas).

## Test

- **inputURL:** `PUT /users/<alice-id>/photo`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": { "contentType": "image/png" }
  }
  ```
- **expectedResult:** `200` or `204`; `photoUrl` updated on follow-up `GET /users/<alice-id>`
