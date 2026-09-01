# MEN-END-02 · Ending a pair without a closure note is rejected

**Trace:** §4.11 ("a closure note is required to close it — a pair cannot be ended without one") · PRD FR-M9 · epics.md Story 1.4 · AD-17 ("Normal closure requires a note stored on the pair")

> **PROVISIONAL ROUTE** (`POST /mentorship-pairs/:id/closure`). Stage-2 blocked
> on G-CTX + G-PERM. **Unapproved draft** — AD-1 approval required; no
> `approvals.yaml`. Negative case, first-class.

## Scenario

**Given** an active pair (Mona → Alice) and Paula, Alice's PP.

**When** Paula attempts to end the pair with no closure note (empty or missing).

**Then** the request is **rejected** and the pair stays `active` — a pair cannot
be ended without a note.

**Preconditions:** [fixture](../README.md#canonical-personas); an active Mona → Alice pair exists.

## Test

- **Test 1 — attempt closure with no note**
  - **inputURL:** `POST /mentorship-pairs/<pairId>/closure`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" }, "body": {} }`
  - **expectedResult:** `422` (or `400`) — validation rejects the missing note; leak-free body.
- **Test 2 — the pair is still active**
  - **inputURL:** `GET /mentorship-pairs/<pairId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" } }`
  - **expectedResult:** `200`; status `active`, `endDate` absent, `closureNote` absent.
