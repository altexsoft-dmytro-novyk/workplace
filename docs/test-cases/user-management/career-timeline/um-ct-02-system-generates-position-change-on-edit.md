# UM-CT-02 · Editing position writes a position_change event

**Trace:** requirements §4.9 · PRD FR-5 · epics.md Story 3.1 (second AC) · tracked type: `position_change` · AD-11 (same-transaction as the `PATCH`)

## Scenario

**Given** Alice currently has `position: "Engineer"`.

**When** Bob (Reporting line, entitled) edits Alice's `position` to `"Senior Engineer"` (`profile/um-pf-01`).

**Then** the system writes a `UserEvents` row for Alice with `type: "position_change"`, `source: "system"`, and `details: { "from": "Engineer", "to": "Senior Engineer" }` — no separate request from Bob is needed to produce it.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded `position: "Engineer"`. **stateChange:** the `PATCH /users/<aliceId>` from `um-pf-01` is the trigger.

## Test

- **inputURL:** `GET /users/<aliceId>/events`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Bob>" } }
  ```
- **expectedResult:** `200`; list contains an event `{ "type": "position_change", "source": "system", "details": { "from": "Engineer", "to": "Senior Engineer" } }`.
