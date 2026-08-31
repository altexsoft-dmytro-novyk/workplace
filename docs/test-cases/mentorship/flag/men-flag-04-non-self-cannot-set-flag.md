# MEN-FLAG-04 · A non-Self actor cannot set someone else's flag

**Trace:** §3.2 S13 Self `RW (own flag)` — write on the own flag is Self-only · §4.11 (self-service) · PRD FR-M1 · epics.md Story 1.1

> **PROVISIONAL ROUTE** (`PUT /users/:id/mentorship-availability`) — spine
> Deferred; stage-2 blocked on G-CTX. **Unapproved draft** — AD-1 approval
> required; no `approvals.yaml`. Negative case, first-class.

## Scenario

**Given** Bob is Alice's direct Unit Manager and holds *assign and end
mentorships*.

**When** Bob attempts to set **Alice's** open-to-mentoring flag.

**Then** the request is denied — the S13 own-flag write is Self-only; no
functional permission and no manager relationship grants it. Alice's flag is
unchanged.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice's flag is unset.

## Test

- **Test 1 — Bob attempts to set Alice's flag**
  - **inputURL:** `PUT /users/<aliceId>/mentorship-availability`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" }, "body": { "openToMentoring": true } }`
  - **expectedResult:** `403`; leak-free body.
- **Test 2 — Alice's flag is unchanged**
  - **inputURL:** `GET /users/<aliceId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Alice>" } }`
  - **expectedResult:** `200`; S13 inline summary shows `openToMentoring: false`.
