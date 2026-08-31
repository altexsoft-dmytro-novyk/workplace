# UM-CT-01 · Creating a user writes a joined_company event

**Trace:** requirements §4.9 · PRD FR-5 · epics.md Story 3.1 (first AC) · tracked type: `joined_company` · AD-11 (same-transaction) · supersedes the `registration/um-reg-01` reference (retired)

## Scenario

**Given** Nina is imported by the **seeded population import** (`seed/um-seed-01`) — there is no `POST /users`.

**When** the import writes Nina's `User` row.

**Then** the system writes a `UserEvents` row for Nina with `type: "joined_company"`, `source: "system"`, and `eventDate` matching her `companyJoinDate` — in the **same transaction** as the row insert (AD-11), not via any HTTP create.

**Preconditions:** [fixture](../README.md#canonical-personas); **stateChange:** Nina's `User` row is written by the seeded population import (`seed/um-seed-01`), which is the trigger — there is no separate request that writes the event.

## Test

- **inputURL:** `GET /users/<ninaId>/events`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Root>" } }
  ```
- **expectedResult:** `200`; list contains exactly one event: `{ "type": "joined_company", "source": "system", "eventDate": "2026-09-01" }`.
