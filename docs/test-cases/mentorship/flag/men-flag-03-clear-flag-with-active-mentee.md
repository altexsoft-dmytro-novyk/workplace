# MEN-FLAG-03 · Clear the flag while holding an active mentee

**Trace:** §4.11 ("Un-flagging" — "A person may clear their open-to-mentoring flag while holding an active mentee. Doing so removes them from the pool for future assignments and does not touch active pairs; their status stays `mentor` while any pair is active.") · PRD FR-M3 · epics.md Story 1.1 · AD-17 ("clearing it never mutates an active pair")

> **PROVISIONAL ROUTE** (`PUT /users/:id/mentorship-availability`) — spine
> Deferred; stage-2 blocked on G-CTX (and G-PERM for the pair-create step).
> **Unapproved draft** — AD-1 approval required; no `approvals.yaml`.

## Scenario

**Given** Mona has an active mentorship pair (Mona → Alice) and her
open-to-mentoring flag is still set; her mentorship status is `mentor`.

**When** Mona clears her own flag.

**Then** the flag clears, **the active pair is untouched**, and Mona's mentorship
status **stays `mentor`** while the pair is active. Mona is removed from the pool
for future assignments only.

**Preconditions:** [fixture](../README.md#canonical-personas); an active pair Mona → Alice exists (`men-pair-01`); Mona's flag is set; Mona's status is `mentor`.

## Test

- **Test 1 — baseline: Mona is `mentor`, flag set, pair active**
  - **inputURL:** `GET /users/<monaId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Mona>" } }`
  - **expectedResult:** `200`; S13 inline summary shows `openToMentoring: true`, mentorship status `mentor`, one active mentee (Alice).
- **Test 2 — Mona clears her flag**
  - **inputURL:** `PUT /users/<monaId>/mentorship-availability`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Mona>" }, "body": { "openToMentoring": false } }`
  - **expectedResult:** `200`; body reflects `openToMentoring: false`.
- **Test 3 — pair untouched, status still `mentor`**
  - **inputURL:** `GET /users/<monaId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Mona>" } }`
  - **expectedResult:** `200`; the Mona → Alice pair is still `active` with the same start date and no end date; mentorship status is still `mentor`; `openToMentoring: false`.
- **Test 4 — Mona absent from the pool**
  - **inputURL:** `GET /willing-mentors`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `200`; list does not include Mona.
