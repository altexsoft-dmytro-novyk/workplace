# AC-M-S07-09 · S7 — UM/DM create notes; flags default off

**Trace:** §3.3.2 (both flags off by default)

## Scenario

**Given** Bob had a 1:1 with Alice.

**When** he writes a management note without touching the visibility flags.

**Then** it is created with both flags off — invisible to Alice and to PMs by default.

**Preconditions:** [fixture](../../README.md)

## Test

- **inputURL:** `POST /users/alice/notes`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    },
    "body": {
      "body": "1:1 summary"
    }
  }
  ```
- **expectedResult:** `201`; created with `visibleForEmployee: false, visibleForPM: false`
