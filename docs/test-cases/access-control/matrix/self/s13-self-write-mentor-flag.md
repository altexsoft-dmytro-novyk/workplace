# AC-M-S13-SE-W-WRITEMENTORFLAG · self set own mentorship flag

**Trace:** §3.2 S13 · §4.3 · AD-10

## Scenario

**Given** Alice is Self on Mentorship (§3.2 RW limited to own open-to-mentor flag).

**When** Alice toggles her own `openToMentoring` flag.

**Then** the flag update succeeds — Self cannot create or end mentorship pairs.

**Preconditions:** [fixture](../../README.md#canonical-personas); seeded Mentorship data for Alice.

## Test

- **inputURL:** `PATCH /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Alice>" },
    "body": {
  "openToMentoring": true
}
  }
  ```
- **expectedResult:** `200`; `openToMentoring: true` on follow-up read
