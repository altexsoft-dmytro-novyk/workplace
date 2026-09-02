# UM-LIST-02 · List employees filtered by a single identity field (`country`)

**Trace:** epics.md Story 1.5 (AC 2) · PRD FR-15 · requirements §4.1

## Scenario

**Given** `User` rows exist with varying `country` values — at least two with
`country: "Poland"` and at least one with a different country, all active.

**When** Root submits `GET /users?country=Poland`.

**Then** the response is `200` and **every** row in `items` has
`country: "Poland"`. Rows with any other country are absent from every page.
The match is **exact equality** — `country=Poland` does not match `"poland"` or
`"Republic of Poland"` (substring / case-insensitive directory search is later
platform scope, not this story). Pagination metadata reflects the filtered
`total`, not the whole population.

**Preconditions:** [fixture](../README.md#canonical-personas); Root holds
`user-management:list`; for this run — two active users with `country: "Poland"`
and one active user with `country: "Germany"`.

## Test

- **inputURL:** `GET /users?country=Poland&pageSize=100`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Root>" } }
  ```
- **expectedResult:** `200`; `items` is non-empty; every `items[].country` is
  exactly `"Poland"`; the run's `Germany` user's `id` is absent; `total` equals
  the count of active `Poland` rows.
