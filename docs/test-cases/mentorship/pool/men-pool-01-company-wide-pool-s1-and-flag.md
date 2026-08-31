# MEN-POOL-01 · Permission-holder reads the company-wide willing-mentor pool

**Trace:** §4.11 ("A list of everyone who has flagged themselves as open to mentoring. The pool is company-wide … The list shows identity-card data plus the flag; it does not expose anyone's S13 section. Visible to holders of the *assign and end mentorships* permission.") · §2.3 · roles table line ~119 · PRD FR-M4 · epics.md Story 1.2

> **PROVISIONAL ROUTE** (`GET /willing-mentors`) — name is the architect's / the
> approved AD-1 scenario's call (`api-conventions.md`). Stage-2 blocked on
> G-CTX + G-PERM (the *assign and end mentorships* permission is unseeded).
> **Unapproved draft** — AD-1 approval required; no `approvals.yaml`.

## Scenario

**Given** willing mentors exist in several different departments — Mona (Dept X),
Nina (Dept Y) — and Bob holds the *assign and end mentorships* permission.

**When** Bob reads the willing-mentor pool.

**Then** the response lists **every** flagged employee regardless of department
(the pool is company-wide), each row carrying **S1 identity-card fields plus the
availability flag only**.

**Preconditions:** [fixture](../README.md#canonical-personas); Mona and Nina have set their flags, in different departments; Bob holds *assign and end mentorships*.

## Test

- **inputURL:** `GET /willing-mentors`
- **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
- **expectedResult:** `200`; the list includes both Mona and Nina even though
  neither is in Bob's department; each entry contains S1 fields (name, position,
  department, …) and `openToMentoring: true`, and nothing else.
