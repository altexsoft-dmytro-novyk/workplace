# ACF-AU-02 · Direct manager reads a report's profile

**Trace:** §2.1 relation 1 · §3.2 Reporting line · AD-10 · ACF-1

**Approved:** Anna Pikula, 2026-08-30

## Scenario

**Given** Bob is Alice's direct unit manager through a live `Relationship type='direct'` row (Alice → Bob).

**When** Bob reads Alice's profile.

**Then** the read is allowed — a live reports-to edge resolves the Reporting line audience for the manager at the other end of it.

**Preconditions:** [fixture](../README.md#foundation-fixture); the Alice → Bob `direct` edge is live.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<bob-id>>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; the profile is returned. Per the provisional mapping, `reporting` is an allowed audience.
