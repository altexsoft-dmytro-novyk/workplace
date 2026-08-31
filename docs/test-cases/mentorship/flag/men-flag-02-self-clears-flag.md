# MEN-FLAG-02 · Self clears own open-to-mentoring flag

**Trace:** §4.11 (self-service) · §3.2 S13 Self `RW (own flag)` · PRD FR-M1 · epics.md Story 1.1

> **PROVISIONAL ROUTE** (`PUT /users/:id/mentorship-availability`) — spine
> Deferred; stage-2 blocked on G-CTX. **Unapproved draft** — AD-1 approval
> required; no `approvals.yaml`.

## Scenario

**Given** Mona has her open-to-mentoring flag set and holds **no active pair**.

**When** Mona clears her own flag.

**Then** the response succeeds and Mona no longer appears in the willing-mentor
pool.

**Preconditions:** [fixture](../README.md#canonical-personas); Mona's flag is set; Mona has no pairs.

## Test

- **Test 1 — baseline: Mona is in the pool**
  - **inputURL:** `GET /willing-mentors`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `200`; list includes Mona.
- **Test 2 — Mona clears her flag**
  - **inputURL:** `PUT /users/<monaId>/mentorship-availability`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Mona>" }, "body": { "openToMentoring": false } }`
  - **expectedResult:** `200`; body reflects `openToMentoring: false`.
- **Test 3 — Mona is gone from the pool**
  - **inputURL:** `GET /willing-mentors`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `200`; list does not include Mona.
