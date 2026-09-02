# UM-EDIT-04 · Setting `ttId` to one already in use rejects the whole write (`409`); `null`-vs-`null` is not a duplicate

**Trace:** [database-schema.md](../../../architecture/database-schema.md) §User (`ttId` nullable, unique) · AD-13 (external identity field; no source column — left `null` on import) · epics.md Story 1.2 (second AC) · Epic 1 context ("`ttId` null-vs-null is not a duplicate")

> **Supersedes `um-pf-04`** (retired in place). Adds the wholesale-rollback and
> `null`-vs-`null` assertions.
>
> **Scope (v1.5).** Entitlement is Epic 0's. Data correctness only. Blocked past
> Stage 1 on the `user-management:edit` seed.

## Scenario

**Given** Alice (`ttId: null`, `workPhone: null`); Colin, a seeded employee
already carrying `ttId: "tt-1042"`; Nina, another seeded employee also with
`ttId: null`; and Bob, Alice's entitled reporting-line editor.

**When** Bob attempts to set Alice's `ttId` to Colin's `"tt-1042"` in a body
that also changes `workPhone`; and, separately, makes an unrelated edit while
Alice's and Nina's `ttId` are both `null`.

**Then** the collision on `"tt-1042"` is rejected `409` wholesale — neither
`ttId` nor `workPhone` changes; and the unrelated edit succeeds — two rows both
holding `ttId: null` is **not** a uniqueness conflict.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded with
`ttId: null`; Colin seeded with `ttId: "tt-1042"`; Nina seeded with
`ttId: null`; real `Relationship` Alice→Bob `type='direct'`;
`user-management:edit` seeded and held; port rebound. Stage 2 resolves ids from
the seeded fixture id table.

## Test

- **Test 1 — conflicting `ttId`, wholesale reject**
  - **inputURL:** `PATCH /users/<aliceId>`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<bobId>>" },
      "body": { "workPhone": "+48 22 000000", "ttId": "tt-1042" }
    }
    ```
  - **expectedResult:** `409`. A follow-up `GET /users/<aliceId>` shows `data`
    has no `ttId` key (projection drops it) — assert directly against the row /
    a `ttId`-exposing read that Alice's `ttId IS NULL` and `workPhone IS NULL`,
    both unchanged.
- **Test 2 — `null` vs `null` is not a duplicate**
  - **inputURL:** `PATCH /users/<aliceId>`
  - **inputRequest:**
    ```json
    {
      "headers": { "authorization": "Bearer <token:<bobId>>" },
      "body": { "position": "Senior Engineer" }
    }
    ```
  - **expectedResult:** `200`; `position` updated. No `409` — Alice's `ttId`
    stays `null` alongside Nina's `ttId: null` with no conflict. The body omits
    `ttId` entirely, so the partial-merge edit path never touches it.
