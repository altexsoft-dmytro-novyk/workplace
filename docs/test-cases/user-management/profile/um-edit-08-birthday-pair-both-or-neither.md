# UM-EDIT-08 · `birthDay` / `birthMonth` on edit — both-or-neither, consistent with import

**Trace:** requirements §3.2 S1 ("birthday (day and month)" — no year) · [database-schema.md](../../../architecture/database-schema.md) §User (`birthDay` 1-31 / `birthMonth` 1-12 — "**both null together or both set together**") · [DEC — incomplete birthday pair](../../../architecture/user-management-test-decisions.md) (a deliberate `NULL` is accepted; a half-pair is rejected) · `seed/um-seed-06` ("Never a half-pair") · epics.md Story 1.2

> **Scope (v1.5).** Data correctness. **In-scenario decision** (confirm at
> approval): the edit path enforces the same pair invariant the import writer
> does — a `PATCH` that would leave exactly one of the pair non-null is `400`.

## Scenario

**Given** Alice, a seeded employee with `birthDay: null`, `birthMonth: null`;
and Bob, Alice's entitled reporting-line editor.

**When** Bob edits Alice's birthday — first supplying only one half of the pair,
then supplying both, then clearing both, then changing one half while the pair
is already whole.

**Then** any request that would leave the pair **half-set** is rejected `400`
(the row invariant is "both null or both set"); a request that sets or clears
**both** succeeds `200`; and once the pair is whole, changing a single half to
another valid value is allowed `200` because the pair stays whole.

**Preconditions:** [fixture](../README.md#canonical-personas); Alice seeded with
both birthday fields `null`; real `Relationship` Alice→Bob `type='direct'`;
`user-management:edit` seeded and held; port rebound.

## Test

- **Test 1 — half-pair rejected**
  - **inputURL:** `PATCH /users/<aliceId>`
  - **inputRequest:** `{ "headers": { "authorization": "Bearer <token:<bobId>>" }, "body": { "birthDay": 14 } }`
  - **expectedResult:** `400` (would leave `birthDay = 14`, `birthMonth = null`);
    Alice's row unchanged (`birthDay IS NULL AND birthMonth IS NULL`).
- **Test 2 — both together set**
  - **inputRequest:** `{ "body": { "birthDay": 14, "birthMonth": 3 } }`
  - **expectedResult:** `200`; `birthDay = 14`, `birthMonth = 3`.
- **Test 3 — one half changed while the pair is whole**
  - **inputRequest:** `{ "body": { "birthMonth": 5 } }`
  - **expectedResult:** `200`; `birthDay = 14`, `birthMonth = 5` — the pair
    stays whole, so a single-field change is fine.
- **Test 4 — both together cleared**
  - **inputRequest:** `{ "body": { "birthDay": null, "birthMonth": null } }`
  - **expectedResult:** `200`; both back to `null`. A deliberate paired `null`
    is valid (DEC — incomplete birthday pair).
- **Test 5 — half-clear rejected**
  - starting from the whole pair (`14` / `5`), **inputRequest:**
    `{ "body": { "birthMonth": null } }`
  - **expectedResult:** `400` (would leave `birthDay = 14`, `birthMonth = null`).
