# UM-LIST-03 · List employees with combined filters (`position` + `city`)

**Trace:** epics.md Story 1.5 (AC 3) · PRD FR-15 · requirements §4.1

## Scenario

**Given** `User` rows exist with varying `position` / `city` combinations,
including rows that match one of the two criteria but not the other, and — since
`city` is nullable after Story 1.1 — at least one active row with `position:
"Engineer"` and `city: null`.

**When** Root submits `GET /users?position=Engineer&city=Krakow`.

**Then** the response is `200` and **every** row in `items` matches **both**
predicates (`position === "Engineer"` **and** `city === "Krakow"`) — the filters
are combined with **AND**. A row matching only `position` (wrong or null `city`)
or only `city` (wrong `position`) is absent. A row whose `city` is `null` never
matches a `city=` filter — an equality predicate does not match `NULL`.

**Preconditions:** [fixture](../README.md#canonical-personas); Root holds
`user-management:list`; for this run — one active user `{position: "Engineer",
city: "Krakow"}` (expected hit), one `{position: "Engineer", city: "Warsaw"}`,
one `{position: "QA Engineer", city: "Krakow"}`, one `{position: "Engineer",
city: null}`.

## Test

- **inputURL:** `GET /users?position=Engineer&city=Krakow&pageSize=100`
- **inputRequest:**
  ```json
  { "headers": { "authorization": "Bearer <token:Root>" } }
  ```
- **expectedResult:** `200`; `items` is non-empty; every row has
  `position: "Engineer"` **and** `city: "Krakow"`; the run's Warsaw-city,
  QA-Engineer, and null-city `id`s are all absent.
