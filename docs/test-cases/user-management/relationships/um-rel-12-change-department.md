# UM-REL-12 · Change an employee's department

**Trace:** epics.md Story 4.3 (Change Employee Department or Department Manager) · PRD FR-10 · access-control.md §2.1 (Department management is a Reporting-line relation) · api-conventions.md shape 4 (`POST/DELETE /users/:id/policies`, `targetType:'department'`) · AD-19

> **BLOCKED — CC-07 + Department edge contract; scenario prose only.** Until the
> Department edge contract identifies the department model, membership, HR
> root/boundary and walk, `department`-targeted policy rows contribute nothing
> (fail-closed, AD-12 / AD-10). The atomic before/after journal is CC-07. Not
> translatable to stage-2 or production until both land.

## Scenario

**Given** Alice belongs to Department A, and Root holds the *change organisational
relationships* permission.

**When** Root moves Alice to Department B from the dedicated organisational-
relationship screen.

**Then** Alice belongs to **exactly one** department (B, not both); Department B's
manager gains Reporting-line access to Alice and Department A's manager loses it
**on the next request**; a `department_change` career event is appended through
the User Management application boundary (Epic 3 wiring); and one before/after
journal record — `before: Department A`, `after: Department B` — commits in the
same transaction as the department change (§3.4, AD-19).

**Preconditions:** [fixture](../README.md#canonical-personas); Alice is in Department A; Departments A and B each have a manager; Root holds *change organisational relationships*.

## Test

- **Test 1 — baseline: Alice is in Department A** — Department A's manager resolves Reporting-line access; Department B's does not.
- **Test 2 — the change** *(exact route/body owned by the Department edge contract; shape-4 `POST /users/<aliceId>/policies` with `targetType:'department'` is the current placeholder)*
  - **expectedResult:** `200`/`201`.
- **Test 3 — observing the change** — Alice is in exactly one department (B); Department B's manager resolves Reporting-line access on the next request, Department A's does not; a `department_change` event exists; one before/after journal record exists. **(BLOCKED: department walk owned by the Department edge contract; journal owned by CC-07.)**
