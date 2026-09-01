# MEN-PAIR-02 · Mentee outside the assigner's access scope is rejected

**Trace:** §4.11 ("Mentee selection is scoped to people the assigner holds access over.") · PRD FR-M5 · epics.md Story 1.3 · AD-9/AD-10 (`resolveAudiences`) · AD-17 (pairs never feed audience resolution)

> **PROVISIONAL** body shape. Stage-2 blocked on G-CTX + G-PERM.
> **Unapproved draft** — AD-1 approval required; no `approvals.yaml`.
> Negative case, first-class.

## Scenario

**Given** Bob holds *assign and end mentorships* and has an access audience only
over his own reports (Alice among them). Eve is an authenticated seeded employee
with **no edges to Bob** — Bob's resolved audience over Eve is empty (colleague).

**When** Bob attempts to create a pair with Mona as mentor and **Eve** as mentee.

**Then** the request is **rejected** and no pair is created — the mentee must be
within the assigner's AccessControl access scope, resolved via
`resolveAudiences(bobId, [eveId])`.

**Preconditions:** [fixture](../README.md#canonical-personas); Eve has no reporting-line / project-line / PP relation to Bob; Mona's flag is set; Bob holds *assign and end mentorships*.

## Test

- **Test 1 — attempt the out-of-scope pairing**
  - **inputURL:** `POST /mentorship-pairs`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" }, "body": { "mentorId": "<monaId>", "menteeId": "<eveId>" } }`
  - **expectedResult:** `403` (write outside the actor's access scope); leak-free body.
- **Test 2 — no pair exists**
  - **inputURL:** `GET /mentorship-pairs`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `200`; no Mona → Eve pair.
