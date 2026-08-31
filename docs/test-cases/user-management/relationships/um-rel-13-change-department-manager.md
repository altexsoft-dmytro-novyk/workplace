# UM-REL-13 · Change a department's manager

**Trace:** epics.md Story 4.3 · PRD FR-10 · access-control.md §2.1 (Department management → Reporting line) · AD-19

> **BLOCKED — CC-07 + Department edge contract; scenario prose only.** Same gate
> as `um-rel-12`. Not translatable to stage-2 or production until both land.

## Scenario

**Given** Department B has manager Bob, Department B contains Alice and a nested
Department C, and Root holds the *change organisational relationships* permission.

**When** Root changes Department B's manager to Nina.

**Then** Nina gains Reporting-line access to every member of Department B **and its
nested departments** (Alice, plus Department C's members) on the next request; Bob
loses it; and one before/after journal record — `before: Bob`, `after: Nina` —
commits in the same transaction as the manager change (§3.4, AD-19).

**Preconditions:** [fixture](../README.md#canonical-personas); Department B has manager Bob and contains Alice + nested Department C; Root holds *change organisational relationships*.

## Test

- **Test 1 — baseline: Bob manages Department B** — Bob resolves Reporting-line access to Alice and Department C's members.
- **Test 2 — the change** *(route/body owned by the Department edge contract)* — **expectedResult:** `200`.
- **Test 3 — observing the change** — Nina resolves Reporting-line access to Alice and Department C's members on the next request; Bob does not; one before/after journal record exists. **(BLOCKED.)**
