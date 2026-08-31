# UM-REL-07 · Non-HR Admin cannot mutate relationships

**Trace:** epics.md Stories 4.1 / 4.2 / 4.3 (common denial) · PRD FR-10 · access-control.md §3.3 ("Every action requires the dedicated *change organisational relationships* permission") · [DEC-UM-002](../../../architecture/user-management-test-decisions.md) (no-target feature check through the facade — never a role-name check)

## Scenario

**Given** Colin is an active session that does **not** hold the *change
organisational relationships* permission (use **Ida** where a functional-role
holder lacking *this specific* permission is needed — DEC-UM-002).

**When** Colin attempts to create a reports-to relationship for Alice (and, once
Story 4.2 lands, to change Alice's People Partner, and once Story 4.3 lands, to
change her department).

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

## Test 1 — reports-to denied

- **inputURL:** `POST /users/<aliceId>/relationships`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": { "type": "direct", "targetId": "<bobId>" }
  }
  ```
- **expectedResult:** `403`.

## Test 2 — People Partner change denied (Story 4.2 — stubbed, blocked on CC-04 + CC-07)

- **inputURL:** `PUT /users/<aliceId>/relationships/people-partner`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": { "targetId": "<ninaId>", "expectedCurrentTargetId": "<paulaId>" }
  }
  ```
- **expectedResult:** `403`; no PP edge change. Stage-2 for this test is blocked with `um-rel-09..11` until CC-04 defines PP persistence and CC-07 the journal.

## Test 3 — department change denied (Story 4.3 — stubbed, blocked on CC-07 + Department edge contract)

- **inputURL:** `POST /users/<aliceId>/policies`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Colin>" },
    "body": { "type": "AR", "targetType": "department", "targetId": "<deptBId>", "targetRole": "member" }
  }
  ```
- **expectedResult:** `403`; no department change. Stage-2 for this test is blocked with `um-rel-12..14` until CC-07 and the Department edge contract land.
