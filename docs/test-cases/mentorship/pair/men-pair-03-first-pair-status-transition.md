# MEN-PAIR-03 · First active pair flips status open-to-mentoring → mentor

**Trace:** §4.11 ("On creation of the first pair, the person's mentorship status changes from open to mentoring to mentor. This status is a filterable field on All Employees.") · PRD FR-M6 · epics.md Story 1.3

> **PROVISIONAL** body shape. Stage-2 blocked on G-CTX + G-PERM.
> **Unapproved draft** — AD-1 approval required; no `approvals.yaml`.

## Scenario

**Given** Mona has status `open to mentoring` (flag set, no pairs).

**When** Bob creates the first pair with Mona as mentor.

**Then** Mona's mentorship status transitions to **`mentor`**.

**Preconditions:** [fixture](../README.md#canonical-personas); Mona's flag is set; Mona has no pairs; Bob holds *assign and end mentorships* and access over the mentee.

## Test

- **Test 1 — baseline: Mona is `open to mentoring`**
  - **inputURL:** `GET /users/<monaId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Mona>" } }`
  - **expectedResult:** `200`; S13 inline mentorship status is `open to mentoring`.
- **Test 2 — create the first pair**
  - **inputURL:** `POST /mentorship-pairs`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" }, "body": { "mentorId": "<monaId>", "menteeId": "<aliceId>" } }`
  - **expectedResult:** `201`.
- **Test 3 — Mona is now `mentor`**
  - **inputURL:** `GET /users/<monaId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Mona>" } }`
  - **expectedResult:** `200`; S13 inline mentorship status is `mentor`.
