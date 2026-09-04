# UM-REL-14 · Making yourself a department's manager is rejected

**Trace:** epics.md Story 4.3 · PRD FR-10 · access-control.md §3.3 ("Every action ... rejects self-assignment") · [database-schema.md](../../../architecture/database-schema.md) §Policies, §AccessJournal · api-conventions.md shape 4 · AD-19 · PM/AD-29 `AccessJournal`

> **The BLOCKED box is removed (2026-09-03).** Self-assignment rejection is an
> **app-level input check before the transaction opens** — it needs neither the
> AC department-tree walk nor anything deferred. The `400`, the
> no-`Policies`-row assertion, and the no-journal assertion are **first-class
> stage-2**. Consistent with `um-rel-10` (PP self-assign) and Story 4.1's
> manager self-assign: **`400`**, not `403` (the actor holds the permission; the
> input is invalid) and not `409` (no concurrent/stale state).

## Scenario

**Given** Root holds the *change organisational relationships* permission
(`org:relationships:write`) and is **not** already the manager of Department B.

**When** Root submits a change making **itself** the manager of Department B —
`PUT /departments/<deptBId>/manager { managerUserId: <rootId> }`.

**Then** the response is **`400`** (the actor cannot be the target of an
organisational-fact change — §3.3; detected before the transaction opens, so no
raw constraint error is surfaced). Department B's manager is unchanged, **no
`Policies` row is created**, no `UserPolicies` link is created, and **no
`AccessJournal` row is written**. Self-assignment is refused regardless of the
actor's audience over the department (§3.3), exactly as for the manager and
People Partner facts.

**Preconditions:** [fixture](../README.md#canonical-personas); Root does not
manage Department B; Root holds *change organisational relationships*.

## Test

- **inputURL:** `PUT /departments/<deptBId>/manager`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Root>" },
    "body": { "managerUserId": "<rootId>" }
  }
  ```
- **expectedResult:** `400`; leak-free body.
- **stateChange:** none. Stage 2 asserts: no `Policies` row with `targetType:
  'department'`, `targetId: <deptBId>`, `targetRole: 'unit-manager'` linked to
  Root; the `AccessJournal` row count for `subjectUserId` = the department's
  prior manager (and for `<deptBId>` in `before`/`after`) is unchanged from
  before the request — the denial short-circuits before the transaction opens.

> **Note.** If the Department-edge contract picks the `POST /users/:id/policies`
> fallback shape instead, the equivalent request is
> `POST /users/<rootId>/policies { type: 'AR', targetType: 'department',
> targetId: <deptBId>, targetRole: 'unit-manager' }` with `<rootId>` also the
> authenticated actor → same `400`, same no-write assertion.
