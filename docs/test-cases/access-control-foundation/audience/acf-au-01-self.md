# ACF-AU-01 · Self reads own profile

**Trace:** §3.2 Self · AD-10 · ACF-1

**Approved:** Anna Pikula, 2026-08-30

## Scenario

**Given** Alice is an authenticated employee and the target of the request is Alice herself.

**When** Alice reads her own profile.

**Then** the read is allowed — Self is evaluated first and resolves without consulting any relationship edge, so a person always reaches their own record even with an empty org graph.

**Preconditions:** [fixture](../README.md#foundation-fixture); no extra state.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<alice-id>>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; the profile is returned. Per the provisional mapping, `self` is an allowed audience.
