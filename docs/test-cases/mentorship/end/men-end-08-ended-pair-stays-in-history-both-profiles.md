# MEN-END-08 · Ended pairs stay in history on both profiles

**Trace:** §4.11 ("Ended pairs remain visible in history on both profiles") · PRD FR-M12 · epics.md Story 1.4 · AD-17 ("Ended pairs remain queryable")

> **PROVISIONAL** route shapes. Stage-2 blocked on G-CTX + G-PERM.
> **Unapproved draft** — AD-1 approval required; no `approvals.yaml`.

## Scenario

**Given** a pair (Mona → Alice) that has been ended with a closure note.

**When** the mentor's profile and the mentee's profile are read.

**Then** the ended pair appears in the pair history on **both** — with its start
date, end date, and `ended` status. It is not deleted (contrast the retired
hard-deleted `Relationship` model).

**Preconditions:** [fixture](../README.md#canonical-personas); ended Mona → Alice pair.

## Test

- **Test 1 — the mentee's profile**
  - **inputURL:** `GET /users/<aliceId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Alice>" } }`
  - **expectedResult:** `200`; S13 inline summary lists the ended Mona → Alice pair with dates and status `ended` (closure note absent for Self per FR-M10).
- **Test 2 — the mentor's profile**
  - **inputURL:** `GET /users/<monaId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Mona>" } }`
  - **expectedResult:** `200`; S13 inline summary lists the same ended pair with dates and status `ended`.
- **Test 3 — the all-pairs view**
  - **inputURL:** `GET /mentorship-pairs?status=ended`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `200`; the ended Mona → Alice pair is listed.
