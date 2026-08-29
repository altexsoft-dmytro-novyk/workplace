# AC-M-S07-RL · Reporting line sees unflagged management notes

**Trace:** §3.2 S7 · §9 DoD

## Scenario

**Given** Bob is Alice's direct manager and a note exists without *visible for employee*.

**When** Bob reads management notes.

**Then** the unflagged note is present — Reporting line RW includes manager-only notes.

**Preconditions:** [fixture](../README.md#canonical-personas); same unflagged note as AC-M-S07-EMP.

## Test

- **inputURL:** `GET /users/<alice-id>/notes`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": {}
  }
  ```
- **expectedResult:** `200`; unflagged note present in items
