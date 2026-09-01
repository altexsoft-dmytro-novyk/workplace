# MEN-VIEW-04 · S13 inline mentorship summary on the profile

**Trace:** §3.2 S13 ("Open-to-mentor flag, assigned mentor, assigned mentees, ended pairs, closure notes") · AD-14 (`GET /users/:id` inline summary) · PRD FR-M17 · epics.md Story 1.5

> Stage-2 blocked on G-CTX + **G-S13** (`canAccessSection('S13', …)` does not
> exist yet — ACM-5 ships S1/S10/S11 only; pending Access Control increment).
> **Unapproved draft** — AD-1 approval required; no `approvals.yaml`.

## Scenario

**Given** Alice has an assigned mentor (Mona), one active mentee of her own
(Nina), and one ended pair as mentor (Alice → Colin, closed with a note).

**When** Paula (Alice's PP — entitled to S13) reads Alice's profile.

**Then** the `GET /users/:id` response carries an inline S13 summary: the flag,
the assigned mentor, the assigned mentees, and the ended pairs — with the closure
note **included** because Paula is PP (FR-M10); a Self read would omit the note.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice has mentor Mona, mentee Nina (active), and an ended Alice → Colin pair with a note; Paula is Alice's PP.

## Test

- **Test 1 — PP sees the full S13 inline summary including the closure note**
  - **inputURL:** `GET /users/<aliceId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `200`; S13 inline summary lists the flag, `mentor: Mona`, `mentees: [Nina]`, and the ended Alice → Colin pair with its `closureNote`.
- **Test 2 — Self sees the same summary without closure notes**
  - **inputURL:** `GET /users/<aliceId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Alice>" } }`
  - **expectedResult:** `200`; same pairs and flag, but every `closureNote` key is **absent** (FR-M10).
