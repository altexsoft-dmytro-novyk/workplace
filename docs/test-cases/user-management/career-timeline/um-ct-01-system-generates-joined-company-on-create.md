# UM-CT-01 · Creating a user writes a joined_company event

**Trace:** requirements §4.9 ("the system writes an event whenever one of the tracked changes occurs") · tracked type: `joined_company`

## Scenario

**Given** Root creates Nina via registration (`registration/um-reg-01`).

**When** the creation succeeds.

**Then** the system writes a `UserEvents` row for Nina with `type: "joined_company"`, `source: "system"`, and `eventDate` matching her `companyJoinDate` — no request from Root is needed to produce it.

**Preconditions:** [fixture](../README.md#canonical-personas); **stateChange:** Nina's `User` row is created by `um-reg-01`, which is the trigger — there is no separate request that writes the event.

## Test

- **inputURL:** `GET /users/<ninaId>/events`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Root>" } }
  ```
- **expectedResult:** `200`; list contains exactly one event: `{ "type": "joined_company", "source": "system", "eventDate": "2026-09-01" }`.
