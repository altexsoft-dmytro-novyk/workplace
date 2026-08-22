# AC-UR-11 · A functional role never widens data access

**Trace:** §2.3 (new role sees its audience through the colleague view) · §2.2

## Scenario

**Given** Ida's role lets her run campaigns, but she has no Manager or PP relationship to Alice.

**When** she opens Alice's profile.

**Then** she gets the plain Colleague view — a functional role never widens what data its holder sees.

**Preconditions:** [fixture](../../README.md); Ida holds role IT Campaigns; no Manager/PP relation to Alice

## Test

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:ida>"
    }
  }
  ```
- **expectedResult:** `200`; **Colleague** view only — the role changed nothing about data visibility
