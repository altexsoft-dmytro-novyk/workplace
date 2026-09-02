# UM-EDIT-07 · An empty / no-op `PATCH` body returns `200` with the current state

**Trace:** [api-conventions.md](../../../architecture/api-conventions.md) shape 1 (`PATCH /users/:id` — partial update) · epics.md Story 1.2 · Epic 1 context ("no `updatedAt`/`updatedBy` column — no named consumer") · [test-cases/README.md](../../README.md) (define behaviour where the source is silent — in-scenario decision, confirm at approval)

> **Scope (v1.5).** Data correctness. **In-scenario decision** (see
> [README](README.md) — "Decisions made in-scenario"): an empty or
> already-satisfied `PATCH` is a **`200` no-op**, not a `400`.

## Scenario

**Given** Alice, a seeded employee (`position: "Engineer"`); and Bob, Alice's
entitled reporting-line editor.

**When** Bob submits (a) an empty body `{}`, and (b) a body whose every value
already equals Alice's current value.

**Then** each returns `200` echoing Alice's unchanged state. There is no
observable mutation — there is no `updatedAt` column, so a no-op is invisible by
construction — and no error: `PATCH` is idempotent, and a client re-submitting a
form minus the fields the DTO strips must not be punished with a `400`.

**Rejected alternative:** `400 "no editable fields supplied"`. Rejected because
it forces every client to diff before sending and offers no safety benefit
(a no-op write is harmless). If Product prefers the `400`, it is a one-line
guard in `EditUserAction` and this scenario flips.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded with
`position: "Engineer"`; real `Relationship` Alice→Bob `type='direct'`;
`user-management:edit` seeded and held; port rebound.

## Test

- **Test 1 — empty body**
  - **inputURL:** `PATCH /users/<aliceId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<bobId>>" }, "body": {} }`
  - **expectedResult:** `200`; body reflects Alice's current, unchanged S1
    fields.
- **Test 2 — body equals current state**
  - **inputRequest:** `{ "body": { "position": "Engineer" } }`
  - **expectedResult:** `200`; `position` still `"Engineer"`; a follow-up
    `GET /users/<aliceId>` is byte-identical to one taken before the `PATCH`.
