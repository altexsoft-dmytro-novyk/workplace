# MEN-END-01 · End a pair with a closure note

**Trace:** §4.11 ("a manager or PP ends a pair explicitly. The end date is recorded, and a closure note is required to close it … The closure note is a field on the pair record, not a feedback record") · §3.2 S13 · PRD FR-M9 · epics.md Story 1.4 · AD-17

> **PROVISIONAL ROUTE** (`POST /mentorship-pairs/:id/closure`) — closure action
> route follows its approved AD-1 scenario (`api-conventions.md`). Stage-2
> blocked on G-CTX + G-PERM + G-CT. **Unapproved draft** — AD-1 approval
> required; no `approvals.yaml`.

## Scenario

**Given** an active pair (Mona → Alice) and Paula, Alice's assigned People
Partner.

**When** Paula ends the pair with a closure note.

**Then** the response succeeds, the end date is recorded, the pair status is
`ended`, and the closure note is stored **on the pair record** (not as an S8
feedback record).

**Preconditions:** [fixture](../README.md#canonical-personas); an active Mona → Alice pair exists; Paula is Alice's PP.

## Test

- **Test 1 — end the pair with a note**
  - **inputURL:** `POST /mentorship-pairs/<pairId>/closure`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" }, "body": { "note": "Six-month pairing complete; Alice now leads her own onboarding buddy." } }`
  - **expectedResult:** `200`; body reflects status `ended`, an `endDate`, and the stored `closureNote`.
- **Test 2 — the pair reads as ended with the note on the record**
  - **inputURL:** `GET /mentorship-pairs/<pairId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `200`; status `ended`, `endDate` set, `closureNote` present on the pair.
