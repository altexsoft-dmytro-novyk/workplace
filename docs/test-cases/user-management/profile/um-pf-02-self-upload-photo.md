# UM-PF-02 · Self photo upload persists

**Trace:** requirements §3.2 S1 ("R (photo RW)") · §4.3 ("upload a photo")

## Scenario

**Given** Alice, viewing her own profile.

**When** Alice uploads a new photo.

**Then** `User.photo` is updated and a subsequent read of her own profile reflects it.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded with `photo: null`.

## Test

- **Test 1 — the write**
  - **inputURL:** `PUT /users/<aliceId>/photo`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Alice>" }, "body": { "photo": "<binary-or-uploaded-file-ref>" } }`
  - **expectedResult:** `200`; body includes a non-null `photo` reference.
- **Test 2 — observing the change**
  - **inputURL:** `GET /users/<aliceId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Alice>" } }`
  - **expectedResult:** `200`; `photo` matches the value returned in Test 1.
