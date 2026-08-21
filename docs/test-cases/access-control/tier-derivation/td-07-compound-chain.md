# AC-TD-07 · Compound chain: reports-to edge then project attachment

**Trace:** §2.1 transitive closure of two relations · AD-10 (one transitive graph)

## Scenario

**Given** Frank manages Dave, Dave is DM of Phoenix, and Alice works on Phoenix; Frank has no direct relation to Alice or Phoenix.

**When** Frank opens Alice's profile.

**Then** the resolver composes the reports-to edge with the project attachment into one chain and grants the full Manager-line view.

**Preconditions:** [fixture](../README.md); Frank holds no direct relation to Alice or Phoenix

## Test

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:frank>"
    }
  }
  ```
- **expectedResult:** `200`; full Manager-line view — a reports-to edge composed with a manages-project attachment in one chain
