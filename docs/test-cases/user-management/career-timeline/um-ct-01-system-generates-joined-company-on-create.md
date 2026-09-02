# UM-CT-01 · Creating a user writes a joined_company event

**Trace:** requirements §4.9 · PRD FR-5, FR-11 · epics.md Story 3.1 (first AC) · tracked type: `joined_company` · AD-11 (same-transaction) · supersedes the `registration/um-reg-01` reference (retired)

## Scenario

**Given** Nina is imported by the **seeded population import** (`seed/um-seed-01`) — there is no `POST /users`.

**When** the import writes Nina's `User` row.

**Then** the system writes a `UserEvents` row for Nina with `type: "joined_company"`, `source: "system"`, and `eventDate` matching her `companyJoinDate` — in the **same transaction** as the row insert (AD-11), not via any HTTP create.

**Preconditions:** [fixture](../README.md#canonical-personas); **stateChange:** Nina's `User` row is written by the seeded population import (`seed/um-seed-01`), which is the trigger — there is no separate request that writes the event.

> **Import-fixture reality:** `docs/Accounts_template.csv` currently carries a
> single data row (a bootstrap Site Administrator, `RegistrationDate` 2026-08-17),
> not the fictional "Nina". Stage 2 asserts against the *actual* imported row —
> `eventDate === <that row's RegistrationDate>` and exactly one `joined_company`
> per imported row — rather than the literal persona/date above. The behaviour
> under test is identical.

## Test

- **inputURL:** `GET /users/:id/events` (the imported user's real id)
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Self>" } }
  ```
  The reader is the imported employee themselves (S9 Self = `R`). **Not** `Root`:
  the bootstrap HR-Admin holds no data audience (§2.2 NORMATIVE — "HR Admin
  grants no data access"), so under the real career-timeline S9 read gate `Root`
  resolves as Colleague and is denied `403` (`um-ct-11` Test 4). The §2.4
  full-profile-access overlay that would let an admin read every timeline is a
  deferred increment. (Stage 1 originally wrote `Bearer <token:Root>` — a
  pre-v1.5 artifact from before the real S9 gate existed; corrected at Stage 3.)
- **expectedResult:** `200` `{ data, canEdit: false }` envelope; `data` contains exactly one event `{ "type": "joined_company", "source": "system", "eventDate": <companyJoinDate> }`. DB-state also asserts the row was written in the same transaction as the `User` insert (AD-11).
