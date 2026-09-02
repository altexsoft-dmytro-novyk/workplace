# UM-LIST-11 · The list has a deterministic default sort; `?sort=` is not supported in this story

**Trace:** epics.md Story 1.5 · PRD FR-15 · requirements §4.1 · [api-conventions.md](../../../architecture/api-conventions.md)
"The four shapes" (shape 1)

## Scenario

**Given** more than one page of active employees exist.

**When** an entitled actor pages through `GET /users` without asking for any
particular order, and separately tries `GET /users?sort=lastName`.

**Then**:

- the list is returned in a **fixed, deterministic order — `lastName` ASC, then
  `firstName` ASC, then `id` ASC** as a stable tiebreaker — so that paging is
  stable: the same row never appears on two pages and no row is skipped between
  adjacent pages. Re-running the same request yields the same order.
- `?sort=` (and `?order=`) are **not accepted** in this story — an unknown query
  key → `400` (`um-list-09`). Caller-chosen sort columns are later directory
  scope.

**Preconditions:** [fixture](../README.md#canonical-personas); Root holds
`user-management:list`; for this run — active employees seeded with `lastName`
values that are **not** in `createdAt` order (e.g. insert "Zieliński", then
"Adamczyk", then "Nowak"), so a `lastName`-sorted result is visibly different
from insertion order.

## Test

- **Test 1 — default order is `lastName, firstName, id` and stable across pages**
  - **inputURL:** `GET /users?pageSize=2` then `GET /users?page=2&pageSize=2`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Root>" } }
    ```
  - **expectedResult:** `200` each; concatenating the run's rows across the two
    pages yields them in non-decreasing `(lastName, firstName, id)` order;
    `Adamczyk` precedes `Nowak` precedes `Zieliński`; no `id` appears on both
    pages.

- **Test 2 — the same request twice yields the same order**
  - **inputURL:** `GET /users?pageSize=100` (twice)
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Root>" } }
    ```
  - **expectedResult:** `200` both; `items[].id` sequences are identical.

- **Test 3 — `?sort=` is rejected**
  - **inputURL:** `GET /users?sort=lastName`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Root>" } }
    ```
  - **expectedResult:** `400`; body names `sort` as unsupported; no list.
