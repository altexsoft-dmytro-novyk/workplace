# UM-EDIT-06 · `PATCH /users/:id` never touches `photo` / `isActive` / `employmentStatus` / `customFields` — each → `400`

**Trace:** epics.md Story 1.2 ("`PATCH /users/:id` never touches `photo` (Story 1.3) or `isActive`") · Epic 1 context (`isActive` is an internal account/row-retention flag only, AD-16; `customFields` S16 has its own route; employment status is Epic 5 departure) · [api-conventions.md](../../../architecture/api-conventions.md) (`photo` → `PUT /users/:id/photo`; `custom-fields` → `PATCH /users/:id/custom-fields`) · [DEC-UM-006](../../../architecture/user-management-test-decisions.md) (writer owns `id` / `createdAt` / `createdBy`) · cross-ref `profile/um-photo-09` Test 1

> **Scope (v1.5).** DTO-shape / data-correctness. The rejection is
> audience-independent. No kernel-seed dependency under Variant A — the Epic 0
> edit gate is audience-only (`canAccessSection(v, 'S1', t) === 'write'`), which
> Bob's reporting-line edge satisfies, so the request reaches the DTO. Pending
> only Story 1.2's own Stage 2 / Stage 3.

## Scenario

**Given** Alice, a seeded active employee with a `photo`, an `EmploymentStatus`
of `active`, and `customFields: {}`; and Bob, Alice's entitled reporting-line
editor.

**When** Bob submits `PATCH` bodies each carrying one field outside the S1
scalar edit surface — `photo`, `isActive`, `employmentStatus`, `customFields`,
`id`, `createdAt`, or `createdBy`.

**Then** each is rejected `400` as a forbidden property; nothing is written;
Alice's `photo`, `isActive`, `EmploymentStatus`, `customFields`, and audit
fields are all unchanged. These change only through their own surfaces — the
photo `PUT` (Story 1.3), the Epic 5 departure workflow, the S16 custom-fields
route — or never (audit fields are writer-owned).

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded as
above; real `Relationship` Alice→Bob `type='direct'` (Bob's
`canAccessSection(Bob, 'S1', Alice)` is `write`); port rebound. Stage 2 resolves
ids from the seeded fixture id table.

## Test

- **Test 1 — `photo` in the body → 400**
  - **inputURL:** `PATCH /users/<aliceId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<bobId>>" }, "body": { "photo": "photos/x/y" } }`
  - **expectedResult:** `400` (`UpdateUserDto.photo` is `@IsEmpty()`); Alice's
    `photo` unchanged. Mirrors `um-photo-09` Test 1.
- **Test 2 — `isActive` → 400** — body `{ "isActive": false }` → `400`; Alice
  still active. `isActive` is the internal row-retention flag (AD-16); there is
  no generic deactivation route.
- **Test 3 — `employmentStatus` → 400** — body `{ "employmentStatus": "dismissed" }`
  → `400`; Alice's current `EmploymentStatus` row unchanged. Departure is the
  Epic 5 workflow.
- **Test 4 — `customFields` → 400** — body `{ "customFields": { "shoeSize": 42 } }`
  → `400`; Alice's `customFields` still `{}`. S16 has its own
  `PATCH /users/:id/custom-fields` route.
- **Test 5 — `id` / `createdAt` / `createdBy` → 400** — each rejected (already
  `@IsEmpty()` on the DTO); writer-owned, never client-supplied (DEC-UM-006).
