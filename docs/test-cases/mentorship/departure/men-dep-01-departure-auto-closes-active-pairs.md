# MEN-DEP-01 · Departure auto-closes the departing person's active pairs

**Trace:** §4.16 ("active mentorship pairs end automatically with a system-generated closure note, bypassing the mandatory-closure-note gate in 4.11") · PRD FR-M14 · epics.md Story 1.6 · AD-16 · AD-17 · AD-20 ("system-closes mentorship pairs") · UM PRD FR-6, epics.md Epic 5 Story 5.2

> **STAGE-2 BLOCKED on G-DEP (CC-06 / the AD-20 executor).** Scenario prose only.
> The `Departure` aggregate, the executor, and this context's exported
> `applyDepartureEffects({departureId, leaseToken, tx})` operation under the
> shared unit of work do not exist yet. **Unapproved draft** — AD-1 approval
> required; no `approvals.yaml`.

## Scenario

**Given** Mona is a mentor in one active pair (Mona → Alice) and a mentee in
another (Nina → Mona), and a departure is recorded for Mona that reaches its
effective date.

**When** the AD-20 departure executor processes Mona's departure and calls
`mentorship`'s exported application service under the shared cross-context
transaction.

**Then** **both** of Mona's active pairs are closed — each with an end date, a
system-generated closure note, the system-closed marker set — and a
`mentorship_end` career event is appended per pair in the same transaction.

**Preconditions:** [fixture](../README.md#canonical-personas); Mona in two active pairs (one as mentor, one as mentee); a recorded departure for Mona at an effective date that has passed.

## Test

- **Test 1 — baseline: two active pairs involving Mona**
  - **inputURL:** `GET /mentorship-pairs?participant=<monaId>&status=active`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; both pairs listed, status `active`.
- **stateChange:** Mona's recorded departure reaches its effective date; the AD-20 executor claims it and invokes `mentorship.applyDepartureEffects(...)` within the shared transaction (CC-06). There is no mentorship HTTP route for this — it is executor-driven.
- **Test 2 — both pairs are system-closed**
  - **inputURL:** `GET /mentorship-pairs?participant=<monaId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Root>" } }`
  - **expectedResult:** `200`; both pairs now status `ended`, each with an `endDate`, a system `closureNote`, and `systemClosed: true`.
