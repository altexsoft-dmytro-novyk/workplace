# UM-CT-02 · Editing position writes a position_change event

**Trace:** requirements §4.9 · tracked type: `position_change`

## Scenario

**Given** Alice currently has `position: "Engineer"`.

**When** Bob (Manager-line) edits Alice's `position` to `"Senior Engineer"` (`profile/um-pf-01`).

**Then** the system writes a `UserEvents` row for Alice with `type: "position_change"`, `source: "system"`, and `details: { "from": "Engineer", "to": "Senior Engineer" }` — no separate request from Bob is needed to produce it.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded `position: "Engineer"`. **stateChange:** the `PATCH /users/<aliceId>` from `um-pf-01` is the trigger.

## Test

- **inputURL:** `GET /users/<aliceId>/events`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Bob>" } }
  ```
- **expectedResult:** `200`; list contains an event `{ "type": "position_change", "source": "system", "details": { "from": "Engineer", "to": "Senior Engineer" } }`.
