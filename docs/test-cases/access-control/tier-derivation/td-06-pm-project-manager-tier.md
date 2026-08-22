# AC-TD-06 · Manager tier via PM project attachment

**Trace:** §2.1 relation 2, consequence 3 · §3.3.2

## Scenario

**Given** Pete is the PM of Phoenix, where Alice works.

**When** Pete opens Alice's profile.

**Then** he is Manager line for every section except S7, where he only reads notes explicitly flagged for PMs — the one documented exception.

**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `GET /users/alice`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:pete>"
    }
  }
  ```
- **expectedResult:** `200`; Manager-line view for every section **except S7**, where Pete is a flag-gated reader (AC-M-S07 group)
