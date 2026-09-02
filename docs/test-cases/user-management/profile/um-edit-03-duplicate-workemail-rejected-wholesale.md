# UM-EDIT-03 · Editing `workEmail` to one already in use rejects the whole write (`409`), nothing partially applied

**Trace:** [database-schema.md](../../../architecture/database-schema.md) §User (`workEmail` unique) · requirements §3.2 S1 · [DEC-UM-007](../../../architecture/user-management-test-decisions.md#dec-um-007--workemail-normalization-oq2--kept-reconciled-to-kernel-reality) (normalized comparison) · epics.md Story 1.2 (second AC — "a conflicting write is rejected wholesale (`409`), leaving the target row unchanged") · Epic 1 context

> **Supersedes `um-pf-03`** (retired in place — ID never reused, per
> [../../README.md](../../README.md)). Adds the **wholesale-rollback** assertion:
> a sibling field in the same body is also not applied.
>
> **Scope (v1.5).** Entitlement is Epic 0's. Data correctness only. Blocked past
> Stage 1 on the `user-management:edit` seed.

## Scenario

**Given** Alice (`position: "Engineer"`, `workEmail: "alice@company.example"`);
Colin, a seeded employee holding `workEmail: "colin@company.example"`; and Bob,
Alice's entitled reporting-line editor.

**When** Bob submits one `PATCH` that changes both Alice's `position` **and**
her `workEmail` to Colin's address.

**Then** the write is rejected `409` on the uniqueness conflict; the whole
request is rolled back — **neither** `workEmail` **nor** `position` changes.
There is no partial update.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice and Colin
seeded as above; real `Relationship` Alice→Bob `type='direct'`;
`user-management:edit` seeded and held; port rebound. Stage 2 resolves ids from
the seeded fixture id table.

## Test

- **Test 1 — conflicting write, wholesale reject**
  - **inputURL:** `PATCH /users/<aliceId>`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<bobId>>" },
      "body": { "position": "Staff Engineer", "workEmail": "colin@company.example" }
    }
    ```
  - **expectedResult:** `409`. A follow-up `GET /users/<aliceId>` shows
    `data.workEmail === "alice@company.example"` **and**
    `data.position === "Engineer"` — both unchanged. The sibling `position`
    change did not slip through.
- **Test 2 — Colin's row is untouched**
  - **inputURL:** `GET /users/<colinId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<bobId>>" } }`
  - **expectedResult:** `200` (Bob is at least a colleague of Colin);
    `data.workEmail === "colin@company.example"`, unchanged — the rejected write
    had no effect on the row it collided with.
