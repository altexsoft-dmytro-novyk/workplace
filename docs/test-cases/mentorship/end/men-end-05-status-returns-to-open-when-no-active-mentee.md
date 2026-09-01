# MEN-END-05 · Status returns to open-to-mentoring when no active mentee remains

**Trace:** §4.11 ("If the mentor has no other active mentees, their status returns to *open to mentoring*.") · PRD FR-M13 · epics.md Story 1.4

> **PROVISIONAL** route shapes. Stage-2 blocked on G-CTX + G-PERM.
> **Unapproved draft** — AD-1 approval required; no `approvals.yaml`.

## Scenario

**Given** Mona is a `mentor` with exactly one active pair (Mona → Alice) and her
open-to-mentoring flag is **still set**.

**When** Paula ends the Mona → Alice pair with a closure note.

**Then** Mona has no remaining active mentee, so her mentorship status returns to
**`open to mentoring`** and she is back in the willing-mentor pool.

**Preconditions:** [fixture](../README.md#canonical-personas); one active Mona → Alice pair; Mona's flag set; Mona's status `mentor`.

## Test

- **Test 1 — baseline: Mona is `mentor`**
  - **inputURL:** `GET /users/<monaId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Mona>" } }`
  - **expectedResult:** `200`; mentorship status `mentor`.
- **Test 2 — end the only pair**
  - **inputURL:** `POST /mentorship-pairs/<pairId>/closure`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" }, "body": { "note": "Pairing concluded." } }`
  - **expectedResult:** `200`.
- **Test 3 — Mona is `open to mentoring` again**
  - **inputURL:** `GET /users/<monaId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Mona>" } }`
  - **expectedResult:** `200`; mentorship status `open to mentoring`.
