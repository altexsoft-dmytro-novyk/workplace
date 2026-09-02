# UM-CT-09 · Holding the timeline permission but lacking S9 write audience → denied — DEFERRED (pending the DEC-UM-001 narrowing)

**Trace:** requirements §4.9 · §3.2 row S9 · PRD FR-12 · epics.md Story 3.2 (third AC: "an actor holds the functional permission but lacks S9 write access ... the request is denied") · [DEC-UM-001](../../../architecture/user-management-test-decisions.md) · access-control.md §2.2 dual gate · [`fr-permission-matrix-draft-2026-09-02.md`](../../../../_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md)

> **Status: `it.todo` — this denial does NOT hold at the current stage.**
> Story 3.2 as shipped gates the manual write on
> `isAllowed(actor, 'profile:timeline:write')` **alone** — there is **no
> data-audience half** in the interim (Dmytro, 2026-09-02; [README](./README.md)).
> A holder of `profile:timeline:write` who is *not* the assigned PP or direct
> Unit Manager is therefore **allowed**, not denied, until the audience half is
> added. Reason for the interim: the only seeded holder is the `hr-admin` role,
> and HR Admin holds **no** S9 write audience at all (§2.2 NORMATIVE — "HR Admin
> grants no data access"), so requiring the audience half now would close the
> gate to everyone.
>
> **Unblock trigger:** the [FR-permission-matrix](../../../../_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md)
> grants `profile:timeline:write` to the People Partner / Unit Manager roles
> **and** DEC-UM-001's audience narrowing is wired
> (`canAccessSection('profile:timeline', target) === 'write'`, scoped to assigned
> PP + direct Unit Manager). At that point holding the permission without the
> narrowed audience is a `403` and this scenario goes live. The prose below is
> the target.

## Scenario (target end-state — `it.todo`)

**Given** an actor who **holds** the `profile:timeline:write` permission but is
**not** Alice's assigned People Partner and **not** her direct Unit Manager —
e.g. a transitive manager two levels up, or a project-derived DM/PM (read-only
for manual mutation under DEC-UM-001).

**When** the actor submits `POST /users/<aliceId>/events` (a manual backfill) or
`DELETE /users/<aliceId>/events/<eventId>`.

**Then** the request is denied (`403`) and **no** event is written or
soft-deleted. Once the DEC-UM-001 narrowing is in force, holding the functional
permission does not satisfy the narrowed S9 write audience — both halves of the
dual gate must hold for a non-HR-Admin holder.

**Preconditions:** [fixture](../README.md#canonical-personas); the DEC-UM-001 audience narrowing is wired; actor holds `profile:timeline:write`; actor is a transitive/project-derived manager of Alice, not her assigned PP or direct UM.

## Test (target — do not run until the unblock trigger lands)

- **inputURL:** `POST /users/<aliceId>/events`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:<transitive-manager-uuid>>" }, "body": { "type": "grade_change", "eventDate": "2023-01-01", "details": {} } }
  ```
- **expectedResult:** `403`; a follow-up `GET /users/<aliceId>/events` does not include the attempted entry.
