# UM-CT-03 · PP manually adds a backfill entry — DEFERRED (pending the FR-matrix grant)

**Trace:** requirements §4.9 · §3.2 row S9 · PRD FR-5, FR-12 · epics.md Story 3.2 (Authorized Actor Manually Adds a Backfill Entry) · [DEC-UM-001](../../../architecture/user-management-test-decisions.md) (target scoping for non-HR-Admin holders — assigned PP + direct Unit Manager) · [DEC-UM-011](../../../architecture/user-management-test-decisions.md) · access-control.md §2.2 dual gate + §3.3 · [`fr-permission-matrix-draft-2026-09-02.md`](../../../../_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md) §4 row `profile:timeline:write`

> **Status: `it.todo` — deferred, not blocked-on-infrastructure.** Story 3.2 as
> shipped seeds `profile:timeline:write` to the **`hr-admin` role only** and gates
> the manual write on `isAllowed(actor, 'profile:timeline:write')` **alone** — a
> feature action, no data-audience half (Dmytro, 2026-09-02; rationale in the
> [career-timeline README](./README.md)). A People Partner does **not** hold
> `profile:timeline:write` at this stage, so Paula's `POST` is denied today.
>
> **Unblock trigger:** the [FR-permission-matrix](../../../../_bmad-output/implementation-artifacts/access-control/fr-permission-matrix-draft-2026-09-02.md)
> grants `profile:timeline:write` to the **People Partner** role (matrix §6 item 4,
> currently `?` pending PO confirmation). At that point this scenario activates
> **and** the DEC-UM-001 audience narrowing must be wired so a PP can only backfill
> **their own assignees** — `canAccessSection('profile:timeline', target) === 'write'`
> scoped to the assigned-PP edge, not every employee. The prose below is the
> target end-state; keep it.

## Scenario (target end-state — `it.todo`)

**Given** Paula, Alice's assigned people partner, once the FR matrix grants the
People Partner role `profile:timeline:write` **and** DEC-UM-001 scopes that grant
to Paula's own assignees.

**When** Paula manually adds a `mentorship_end` entry dated before the system existed, sourced from the legacy Excel record.

**Then** the entry is created with `source: "manual"` and appears in Alice's timeline.

**And** the same `POST` for an employee Paula is **not** the assigned PP of is denied `403` (the DEC-UM-001 scoping — a PP is not a global timeline editor).

This scenario proves the **manual backfill path** for a non-HR-Admin holder (DEC-UM-011). It does not exercise Epic 4's automatic `mentorship_end` from relationship unpair — that is covered by `relationships/um-rel-05`.

**Preconditions:** [fixture](../README.md#canonical-personas); People Partner role holds `profile:timeline:write`; Paula is Alice's assigned PP.

## Test (target — do not run until the unblock trigger lands)

- **Test 1 — the write**
  - **inputURL:** `POST /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" }, "body": { "type": "mentorship_end", "eventDate": "2024-03-15", "details": {} } }`
  - **expectedResult:** `201`; body is the bare `UserEventResponse` with `source: "manual"`, `type: "mentorship_end"` (see [career-timeline README](./README.md) for the response-shape decision).
- **Test 2 — observing it in the timeline**
  - **inputURL:** `GET /users/<aliceId>/events`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Alice>" } }` (Self read — Paula would also see it as assigned PP)
  - **expectedResult:** `200`; `data` includes the entry from Test 1.
- **Test 3 — the PP scoping (DEC-UM-001)**
  - **inputURL:** `POST /users/<ninaId>/events` (Nina — Paula is not her assigned PP)
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:Paula>" }, "body": { "type": "grade_change", "eventDate": "2022-01-01", "details": {} } }`
  - **expectedResult:** `403`; no event written.
