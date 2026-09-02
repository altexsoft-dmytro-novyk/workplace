# UM-REL-12 · Change an employee's department

**Trace:** epics.md Story 4.3 (Change Employee Department or Department Manager) · PRD FR-10 · access-control.md §2.1 (Department management is a Reporting-line relation) · api-conventions.md shape 4 (`POST/DELETE /users/:id/policies`, `targetType:'department'`) · AD-19

> **BLOCKED — CC-07 + Department edge contract; scenario prose only.** Until the
> Department edge contract identifies the department model, membership, HR
> root/boundary and walk, `department`-targeted policy rows contribute nothing
> (fail-closed, AD-12 / AD-10). The atomic before/after journal is CC-07. Not
> translatable to stage-2 or production until both land.
>
> **Note (2026-09-02):** §4.17 was amended — an employee holds **one or more**
> current `DepartmentMembership` rows (`database-schema.md` §Project/Department),
> and `department_change` events are add/remove events. This scenario models a
> **move** (Alice ends up in B only). Whether "move" replaces the sole membership
> or ends one and adds another — and the multi-membership add/remove cases — is
> for this story's Epic 4 scenario pass to fix; the Story 1.1 decisions don't
> settle it.

## Scenario

**Given** Alice belongs to Department A, and Root holds the *change organisational
relationships* permission.

**When** Root moves Alice to Department B from the dedicated organisational-
relationship screen.

**Then** Alice's membership reflects the move — she holds a current membership in
B and no longer in A (this scenario's move semantics; see the 2026-09-02 note
above); Department B's manager gains Reporting-line access to Alice and Department
A's manager loses it **on the next request**; a `department_change` career event is appended through
the User Management application boundary (Epic 3 wiring); and one before/after
journal record — `before: Department A`, `after: Department B` — commits in the
same transaction as the department change (§3.4, AD-19).

**Preconditions:** [fixture](../README.md#canonical-personas); Alice is in Department A; Departments A and B each have a manager; Root holds *change organisational relationships*.

## Test

- **Test 1 — baseline: Alice is in Department A** — Department A's manager resolves Reporting-line access; Department B's does not.
- **Test 2 — the change** *(exact route/body owned by the Department edge contract; shape-4 `POST /users/<aliceId>/policies` with `targetType:'department'` is the current placeholder)*
  - **expectedResult:** `200`/`201`.
- **Test 3 — observing the change** — Alice holds a current membership in B and not in A (move semantics per the 2026-09-02 note); Department B's manager resolves Reporting-line access on the next request, Department A's does not; a `department_change` event exists; one before/after journal record exists. **(BLOCKED: department walk owned by the Department edge contract; journal owned by CC-07.)**
