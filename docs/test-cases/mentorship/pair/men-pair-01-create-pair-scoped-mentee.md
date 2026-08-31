# MEN-PAIR-01 · Create a pair with a mentee in the assigner's access scope

**Trace:** §4.11 ("Clicking a willing mentor opens an assignment flow. Mentee selection is scoped to people the assigner holds access over.") · PRD FR-M5, FR-M6 · epics.md Story 1.3 · AD-14 (`POST /mentorship-pairs`) · AD-17

> **PROVISIONAL:** `POST /mentorship-pairs` is fixed by AD-14; the request body
> shape is the architect's. Stage-2 blocked on G-CTX + G-PERM + G-CT.
> **Unapproved draft** — AD-1 approval required; no `approvals.yaml`.

## Scenario

**Given** Mona is in the willing-mentor pool, Alice is within Bob's AccessControl
access scope (Bob is Alice's direct Unit Manager), and Bob holds *assign and end
mentorships*.

**When** Bob creates a mentorship pair with Mona as mentor and Alice as mentee.

**Then** the response is `201` and a durable `MentorshipPair` exists — mentor
Mona, mentee Alice, status active, start date recorded, end date null, no closure
note.

**Preconditions:** [fixture](../README.md#canonical-personas); Mona's flag is set; Bob has reporting-line access over Alice; Bob holds *assign and end mentorships*.

## Test

- **Test 1 — create the pair**
  - **inputURL:** `POST /mentorship-pairs`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" }, "body": { "mentorId": "<monaId>", "menteeId": "<aliceId>" } }`
  - **expectedResult:** `201`; body reflects mentor Mona, mentee Alice, status `active`, a start date, `endDate` absent, `closureNote` absent.
- **Test 2 — the pair is retrievable**
  - **inputURL:** `GET /mentorship-pairs`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `200`; list includes the Mona → Alice active pair.
