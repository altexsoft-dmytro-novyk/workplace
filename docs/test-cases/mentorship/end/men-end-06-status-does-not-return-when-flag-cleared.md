# MEN-END-06 · Status does not return to the pool when the flag was cleared

**Trace:** §4.11 ("Un-flagging" — clearing the flag "removes them from the pool for future assignments"; "their status stays `mentor` while any pair is active") + ("If the mentor has no other active mentees, their status returns to *open to mentoring*" — **unless** the flag was cleared) · PRD FR-M13 · epics.md Story 1.4

> **PROVISIONAL** route shapes. Stage-2 blocked on G-CTX + G-PERM.
> **Unapproved draft** — AD-1 approval required; no `approvals.yaml`.
>
> **Reading note — PRD FR-M13 is marked "inferred (decomposition)".** §4.11
> states both rules separately ("returns to *open to mentoring*" when no active
> mentee remains; "removes them from the pool for future assignments" on
> un-flag); this scenario asserts their **combination** — a mentor who *cleared*
> the flag before their last pair ended is **not** auto-returned to the pool.
> Flag to PO for confirmation if the reading is disputed.

## Scenario

**Given** Mona is a `mentor` with one active pair (Mona → Alice) and she has
**already cleared** her open-to-mentoring flag (`men-flag-03`).

**When** Paula ends the Mona → Alice pair with a closure note.

**Then** Mona has no active mentee, but because her flag was cleared she is **not**
returned to the willing-mentor pool; her status is not `mentor` and not
`open to mentoring` (she is simply not in the pool).

**Preconditions:** [fixture](../README.md#canonical-personas); one active Mona → Alice pair; Mona's flag **cleared**; Mona's status `mentor` (still, per FR-M3, while the pair is active).

## Test

- **Test 1 — baseline: flag cleared, status `mentor`, pair active**
  - **inputURL:** `GET /users/<monaId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Mona>" } }`
  - **expectedResult:** `200`; `openToMentoring: false`, mentorship status `mentor`.
- **Test 2 — end the only pair**
  - **inputURL:** `POST /mentorship-pairs/<pairId>/closure`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" }, "body": { "note": "Pairing concluded." } }`
  - **expectedResult:** `200`.
- **Test 3 — Mona is not in the pool and not `open to mentoring`**
  - **inputURL:** `GET /users/<monaId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Mona>" } }`
  - **expectedResult:** `200`; `openToMentoring: false`; mentorship status is neither `mentor` nor `open to mentoring`.
- **Test 4 — absent from the pool**
  - **inputURL:** `GET /willing-mentors`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `200`; list does not include Mona.
