# AC-TD-04 · Manager tier two levels up, no explicit grant

**Trace:** §2.1 consequence 1 (transitive closure over reports-to)

## Scenario

**Given** Carol is Bob's manager and holds no direct edge to Alice.

**When** Carol opens Alice's profile.

**Then** the transitive walk over reports-to gives her the same Manager-line view Bob gets — no explicit grant needed.

**Preconditions:** [fixture](../README.md); Carol has **no** direct edge to Alice (Alice→Bob→Carol)

## Test

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:carol>"
    }
  }
  ```
- **expectedResult:** `200`; full Manager-line view — identical section set to AC-TD-03
