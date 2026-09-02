# UM-LIST-10 · A filter that matches nothing returns `200` with an empty page and valid metadata

**Trace:** epics.md Story 1.5 · PRD FR-15 · [api-conventions.md](../../../architecture/api-conventions.md)
"The four shapes" (shape 1)

## Scenario

**Given** an entitled actor with `user-management:list`.

**When** they submit a syntactically valid `GET /users` query whose predicates
match no row (`?country=Atlantis`), or request a `page` beyond the last page of a
non-empty result.

**Then** the response is **`200`** (not `404`, not `400`) with
`items: []` and a **complete, consistent** pagination envelope: `page` echoes the
request, `pageSize` echoes the request, `total` is `0` for the no-match query
(or the real filtered total for the beyond-last-page case), and `totalPages` is
`ceil(total / pageSize)`. An empty directory is a valid state, not an error.

**Preconditions:** [fixture](../README.md#canonical-personas); Root holds
`user-management:list`; no `User` has `country: "Atlantis"`; for Test 2, a
`country` value matched by exactly one active row exists this run.

## Test

- **Test 1 — no row matches**
  - **inputURL:** `GET /users?country=Atlantis&page=1&pageSize=25`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Root>" } }
    ```
  - **expectedResult:** `200`; `items` is `[]`; `page === 1`, `pageSize === 25`,
    `total === 0`, `totalPages === 0`.

- **Test 2 — page beyond the last page of a non-empty result**
  - **inputURL:** `GET /users?country=<single-match-run-country>&page=9&pageSize=25`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Root>" } }
    ```
  - **expectedResult:** `200`; `items` is `[]`; `page === 9`, `pageSize === 25`,
    `total === 1`, `totalPages === 1`.
