# MEN-VIEW-05 · Mentorship status is a filterable directory field

**Trace:** §4.11 ("This status is a filterable field on All Employees.") · §4.1 (filter list includes "mentorship status"; example view "all people open to mentoring") · PRD FR-M15 · epics.md Story 1.5 · NFR-M3

> **Directory engine is platform scope**, not this context — this scenario
> asserts only that mentorship supplies a correct, non-leaking status field the
> directory consumes. Stage-2 blocked on G-CTX (status stored-vs-computed +
> the read path is an architect hand-off). **Unapproved draft** — AD-1
> approval required; no `approvals.yaml`.

## Scenario

**Given** Mona has status `mentor`, Nina has status `open to mentoring`, and Colin
has no mentorship status.

**When** an entitled directory user filters All Employees by mentorship status.

**Then** each employee resolves to `mentor` / `open to mentoring` / (neither), and
the filter does not leak a status value to a viewer who could not otherwise see
it (NFR-M3 / §3.3.6-style side-channel rule).

**Preconditions:** [fixture](../README.md#canonical-personas); Mona `mentor`, Nina `open to mentoring`, Colin none.

## Test

- **Test 1 — filter: mentors**
  - **inputURL:** `GET /users?mentorshipStatus=mentor`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; every returned row has mentorship status `mentor` (Mona present; Nina and Colin absent).
- **Test 2 — filter: open to mentoring**
  - **inputURL:** `GET /users?mentorshipStatus=open-to-mentoring`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; Nina present; Mona and Colin absent.
