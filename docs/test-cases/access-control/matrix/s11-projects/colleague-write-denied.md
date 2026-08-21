# AC-M-S11-08 · S11 Projects — Colleague: write denied

**Trace:** §3.2 S11 / Colleague `R (name only)`

## Scenario

**Given** Colin can see the names of Alice's projects.

**When** he tries to change them.

**Then** 403 — colleague access to S11 is read-only, name-only.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `PATCH /users/alice/sections/s11`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:colin>"
    },
    "body": {
      "project": "Atlas"
    }
  }
  ```
- **expectedResult:** `403 Forbidden`; unchanged
