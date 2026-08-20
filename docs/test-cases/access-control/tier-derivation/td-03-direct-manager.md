# AC-TD-03 · Manager tier via direct reports-to edge

**Trace:** §2.1 relation 1 (reports to)

## Scenario

**Given** Bob is Alice's unit manager — she reports to him directly.

**When** Bob opens Alice's profile.

**Then** he gets the full Manager-line view, S7 included, since a UM reads management notes regardless of flags.

**Preconditions:** [fixture](../README.md)

## Test

- **inputURL:** `GET /users/alice/profile`
- **inputRequest:**
  ```json
  {
    "headers": {
      "authorization": "Bearer <token:bob>"
    }
  }
  ```
- **expectedResult:** `200`; Manager-line view: every section of the §3.2 Manager column incl. S6, S7 (Bob is UM, not PM)
