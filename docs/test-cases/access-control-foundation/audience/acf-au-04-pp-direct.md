# ACF-AU-04 · Assigned People Partner reads the profile

**Trace:** §2.1 · §3.2 PP · AD-19 · ACF-1

## Scenario

**Given** Paula is Alice's assigned People Partner through a `Relationship type='people_partner'` row, and Paula is nowhere in Alice's reporting chain.

**When** Paula reads Alice's profile.

**Then** the read is allowed — the PP audience derives from the assignment fact alone. It is a separate column from Reporting line, not a special case of it.

**Preconditions:** [fixture](../README.md#foundation-fixture); the Alice → Paula `people_partner` edge is live.

## Test

- **inputURL:** `GET /users/<alice-id>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:<paula-id>>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; the profile is returned. Per the provisional mapping, `pp` is an allowed audience.
