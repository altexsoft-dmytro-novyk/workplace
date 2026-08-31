# UM-PF-03 · Editing workEmail to an address already in use is rejected

**Trace:** database-schema.md `User.workEmail` (unique) · requirements §3.2 S1 (Reporting line: RW) · [DEC-UM-007](../../../architecture/user-management-test-decisions.md) · epics.md Story 1.2 (second AC)

> **Scope (v1.5).** Entitlement (who may `PATCH /users/:id`) is Epic 0's
> (`access-control-adoption/`). This file asserts **data correctness**: the write
> is rejected wholesale on the uniqueness conflict (`409`) and the row is
> unchanged. `workEmail` comparison is against the **normalized** value
> (DEC-UM-007 — the DTO already trims+lowercases on write). Alice/Colin are
> **seeded** (Story 1.1); stage 2 resolves ids from the seeded fixture id table.

## Scenario

**Given** Bob, Alice's unit manager, and Colin, an existing user with `workEmail: colin@company.example`.

**When** Bob attempts to change Alice's `workEmail` to Colin's address.

**Then** the write is rejected on the uniqueness constraint; Alice's `workEmail` is unchanged.

**Preconditions:** [fixture](../README.md#canonical-personas); Colin seeded with `workEmail: colin@company.example`.

## Test

- **inputURL:** `PATCH /users/<aliceId>`
- **inputRequest:**
  ```json
  {
    "headers": { "authorization": "Bearer <token:Bob>" },
    "body": { "workEmail": "colin@company.example" }
  }
  ```
- **expectedResult:** `409`; a follow-up `GET /users/<aliceId>` shows Alice's original `workEmail` unchanged.
