# UM-DEACT-03 · Deactivating a user without the HR Admin permission is denied

**Trace:** PRD Data Model — User.isActive · own assumption on actor, see SPEC assumptions

## Scenario

**Given** Bob, Alice's unit manager, holding no HR Admin functional role.

**When** Bob attempts to deactivate Alice.

**Then** the request is denied — deactivation is assumed HR-Admin-gated, by symmetry with registration (`um-reg-03`).

**Preconditions:** [fixture](../README.md#canonical-personas); Bob holds no HR Admin functional role; Alice seeded `isActive: true`.

## Test

- **inputURL:** `DELETE /users/<aliceId>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Bob>" } }
  ```
- **expectedResult:** `403`; a follow-up `GET /users/<aliceId>` shows `isActive: true`, unchanged.
