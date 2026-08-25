# UM-DEACT-03 · Deactivating a user without the deactivation capability is denied

**Trace:** [DEC-UM-002](../../../architecture/user-management-test-decisions.md) · requirements §2.3 (granular feature permissions) · epics.md Story 1.4

## Scenario

**Given** Ida, an authenticated employee holding the custom functional role *IT Campaigns*, whose only permission is *create form campaigns* — not the deactivation capability.

**When** Ida attempts to deactivate Alice.

**Then** the request is denied with `403`. Deactivation is gated by an AccessControl **feature capability**, not a hard-coded role name in user-management code.

Ida rather than Bob is deliberate (DEC-UM-002): Bob is a manager and could pass a coarse "non-HR-Admin" gate without proving capability granularity. Ida holds an unrelated functional permission and lacks the capability under test.

**Preconditions:** [fixture](../README.md#canonical-personas); Ida holds role *IT Campaigns* only; Alice seeded `isActive: true`.

## Test

- **inputURL:** `DELETE /users/<aliceId>`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Ida>" } }
  ```
- **expectedResult:** `403`; a follow-up `GET /users/<aliceId>` shows `isActive: true`, unchanged.
