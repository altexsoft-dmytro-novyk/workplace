# UM-LIST-01 · List employees returns one page plus pagination metadata

**Trace:** epics.md Story 1.5 (AC 1) · PRD FR-15 · requirements §4.1 · [api-conventions.md](../../../architecture/api-conventions.md) "The four shapes" (shape 1, `GET /users`) · AD-14

## Scenario

**Given** more than one page of `User` rows exist (at least `pageSize + 1` active
employees), seeded through the population import / direct inserts — there is no
`POST /users` in v1.5.

**When** an entitled actor (Root, holding the no-target `user-management:list`
capability) submits `GET /users?page=1&pageSize=25`.

**Then** the response is `200` and the body is the offset-pagination envelope
`{ items, page, pageSize, total, totalPages }`:

- `items` is an array of **at most `pageSize`** list rows, each the fixed
  permission-safe projection (see `um-list-08` for the exact key set);
- `page` echoes the requested page (`1`), `pageSize` echoes `25`;
- `total` is the count of rows matching the query **before** paging (`>= 26`);
- `totalPages` is `ceil(total / pageSize)`.

Requesting `page=2` returns the next slice; `items` on page 2 is disjoint from
page 1 and, together with page 1, contains no duplicate `id`. A `page` beyond
`totalPages` returns `200` with `items: []` and the same `total` / `totalPages`
(see `um-list-10`). `pageSize` is capped at 100 — `pageSize=101` → `400`.
Omitting both params applies the defaults `page=1`, `pageSize=25`.

**Preconditions:** [fixture](../README.md#canonical-personas); Root has a live
`hr-admin` FR grant chain (`user-management:list`); >= 26 active `User` rows exist
for this run (each with a current `EmploymentStatus` of `active`).

## Test

- **Test 1 — first page carries a bounded slice and full metadata**
  - **inputURL:** `GET /users?page=1&pageSize=25`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Root>" } }
    ```
  - **expectedResult:** `200`; body has keys `items`, `page`, `pageSize`, `total`,
    `totalPages`. `items` is an array with `1 <= length <= 25`. `page === 1`,
    `pageSize === 25`, `total >= 26`, `totalPages === ceil(total / 25)`.

- **Test 2 — second page is a disjoint slice**
  - **inputURL:** `GET /users?page=2&pageSize=25`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Root>" } }
    ```
  - **expectedResult:** `200`; `page === 2`; the set of `items[].id` shares no
    element with the page-1 result; `total` and `totalPages` are unchanged.

- **Test 3 — page size cap**
  - **inputURL:** `GET /users?pageSize=101`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Root>" } }
    ```
  - **expectedResult:** `400`; body names `pageSize` as out of range; no list is
    returned.

- **Test 4 — defaults when params are omitted**
  - **inputURL:** `GET /users`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Root>" } }
    ```
  - **expectedResult:** `200`; `page === 1`, `pageSize === 25`.
