# UM-REL-07 · Non-HR Admin cannot mutate relationships

**Trace:** epics.md Stories 4.1 / 4.2 / 4.3 (common denial) · PRD FR-10 · access-control.md §3.3 ("Every action requires the dedicated *change organisational relationships* permission") · [DEC-UM-002](../../../architecture/user-management-test-decisions.md) (no-target feature check through the facade — never a role-name check)

## Scenario

**Given** Ida holds a custom functional role whose only permission is unrelated
(*create form campaigns*) and therefore does **not** hold the *change
organisational relationships* permission (DEC-UM-002 — the probe is a
capability-negative, so the persona is Ida, not an unrelated bare session);
Colin is an unrelated active session used for the same denial from the other
direction.

**When** Ida (or Colin) attempts to create a reports-to relationship for Alice
(and, once Story 4.2 lands, to change Alice's People Partner, and once Story 4.3
lands, to change her department).

**Then** every such request is denied with `403` and no relationship, journal, or
career-event row is written. The gate is the `isAllowed(viewer, 'change
organisational relationships')` no-target feature check through the real facade
(the ACM-2 `isAllowed` path once Epic 0 rebinds the port) — **not** an
`actor.position === 'HR Admin'` string check, which AD-4 / access-control.md
prohibit.

> **v1.5 correction.** The pre-v1.5 wording tied this gate to "HR Admin" and
> carried a temporary-simplification note about mentorship pair/unpair authority.
> In v1.5 the sourced rule is the single dedicated *change organisational
> relationships* permission for all four organisational facts (manager, PP,
> department, department manager); mentorship pair lifecycle has left User
> Management entirely (`um-rel-04..06` retired, AD-17).

**Preconditions:** [fixture](../README.md#canonical-personas); Colin (and Ida) do not hold *change organisational relationships*.

## Test 1 — reports-to denied (Story 4.1, live)

- **inputURL:** `POST /users/<aliceId>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Ida>" },
    "body": { "type": "direct", "targetId": "<bobId>" }
  }
  ```
- **expectedResult:** `403` — the `isAllowed(viewer, 'change organisational relationships')` no-target facade check fails before any write.
- **stateChange:** none. Stage 2 asserts no new `Relationship` row for Alice and no new `AccessJournal` row with `subjectUserId: aliceId` (the denial short-circuits before the transaction opens).
- **variant:** repeat with `Bearer <token:Colin>` (unrelated bare session) → identical `403`.

## Test 2 — People Partner change denied (Story 4.2 — live; direct assigned-PP edge)

- **inputURL:** `PUT /users/<aliceId>/relationships/people-partner`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": { "targetId": "<ninaId>", "expectedCurrentTargetId": "<paulaId>" }
  }
  ```
- **expectedResult:** `403`; no PP edge change, no `AccessJournal` row — the `isAllowed(viewer, 'change organisational relationships')` no-target facade check fails before the transaction opens. See `um-rel-16` Test 3 for the `PUT`/`DELETE` denial pair with the Ida persona. *(Story 4.2 reconciled 2026-09-03 — CC-07/PM/AD-29 done via Story 4.1, CC-04 design-resolved `P2`; only HR-line propagation above the directly assigned PP stays deferred.)*

## Test 3 — department change denied (Story 4.3 — stubbed, blocked on the Department edge contract)

- **inputURL:** `POST /users/<aliceId>/policies`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": { "type": "AR", "targetType": "department", "targetId": "<deptBId>", "targetRole": "member" }
  }
  ```
- **expectedResult:** `403`; no department change, no `AccessJournal` row. Stage-2 for this test is blocked with `um-rel-12..14` until the Department edge contract lands. *(The journal itself is unblocked — PM/AD-29 ratified 2026-09-02.)*
