# MEN-FLAG-01 · Self sets own open-to-mentoring flag

**Trace:** §4.11 (self-service "Mark themselves as open to mentoring") · §3.2 S13 Self `RW (own flag)` · §4.3 · PRD FR-M1 · epics.md Story 1.1 · AD-17

> **PROVISIONAL ROUTE.** The availability-flag endpoint and its owning aggregate
> are the spine Deferred open question ("Do not infer it as a relationship
> patch"). `PUT /users/:id/mentorship-availability` is a placeholder pending the
> architect's decision — stage-2 blocked on G-CTX.
>
> **Unapproved draft** — per-file AD-1 approval still required. `approvals.yaml`
> does not exist.

## Scenario

**Given** Mona is a seeded employee whose open-to-mentoring flag is unset, and she
is viewing her own profile.

**When** Mona sets her own open-to-mentoring flag.

**Then** the response succeeds and Mona now appears in the company-wide
willing-mentor pool — observed by a permission-holder reading the pool
(`men-pool-01`). §3.2 S13 grants Self `RW` on the own flag.

**Preconditions:** [fixture](../README.md#canonical-personas); Mona's flag is unset; Mona holds no pairs.

## Test

- **Test 1 — baseline: Mona is not in the pool**
  - **inputURL:** `GET /willing-mentors`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `200`; list does not include Mona.
- **Test 2 — Mona sets her flag**
  - **inputURL:** `PUT /users/<monaId>/mentorship-availability`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Mona>" }, "body": { "openToMentoring": true } }`
  - **expectedResult:** `200`; body reflects `openToMentoring: true`.
- **Test 3 — Mona now appears in the pool**
  - **inputURL:** `GET /willing-mentors`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Bob>" } }`
  - **expectedResult:** `200`; list includes Mona with S1 identity fields and the flag.
