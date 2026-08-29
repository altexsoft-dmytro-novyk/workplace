# ACF-AU-03 · Manager's manager reads through the chain

**Trace:** §2.1 relation 1 · §3.2 Reporting line · AD-10 · ACF-1

## Scenario

**Given** Alice reports to Bob and Bob reports to Carol, both through `Relationship type='direct'` rows, and Carol holds no direct edge to Alice.

**When** Carol reads Alice's profile.

**Then** the read is allowed — the Reporting walk is recursive, so every ancestor on the `direct` chain resolves the Reporting line audience. Nothing about Carol is stored on Alice; the audience is derived per request.

**Preconditions:** [fixture](../README.md#foundation-fixture); both `direct` edges live; no Alice → Carol edge exists.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<carol-id>>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; the profile is returned through the transitive walk, not through a stored pointer.
