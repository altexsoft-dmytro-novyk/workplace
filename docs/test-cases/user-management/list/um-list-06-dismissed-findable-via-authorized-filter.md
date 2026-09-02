# UM-LIST-06 · A dismissed employee is findable via the authorized employment-status filter

**Trace:** epics.md Story 1.5 (AC 4) · PRD FR-15, FR-6 · requirements §4.1, §4.16

## Scenario

**Given** Colin's current `EmploymentStatus` is `dismissed` (per `um-list-05`)
and Alice's is `active`.

**When** an entitled actor re-runs the list with the authorized employment-status
filter: `GET /users?employmentStatus=dismissed`.

**Then** the response is `200` and Colin's `id` **is** returned; every row in
`items` has `employmentStatus: "dismissed"` and Alice (active) is absent.
`?employmentStatus=active` returns the same set as the unfiltered default (active
only); `?employmentStatus=dismissed` is the only way to see dismissed rows.
Using the filter requires **only** the `user-management:list` capability that
gates the endpoint itself — there is no separate "see dismissed employees"
permission in this story (see the README decision list). An unrecognised value
(`?employmentStatus=retired`) → `400`.

`employmentStatus` is a **filter-only visibility predicate** plus a projected
field (`um-list-08`); it is a sanctioned FR-6 exception to "only permission-safe
`User`-row fields are filters", distinct from the rejected internal `isActive`
filter (`um-list-09`).

**Preconditions:** [fixture](../README.md#canonical-personas); Root holds
`user-management:list`; Colin's current `EmploymentStatus` is `dismissed`,
Alice's is `active` (seeded directly — same `stateChange` as `um-list-05`).

## Test

- **Test 1 — the authorized filter surfaces the dismissed employee**
  - **inputURL:** `GET /users?employmentStatus=dismissed&pageSize=100`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Root>" } }
    ```
  - **expectedResult:** `200`; `items[].id` contains Colin's `id`; every
    `items[].employmentStatus === "dismissed"`; Alice's `id` is absent.

- **Test 2 — `employmentStatus=active` mirrors the default list**
  - **inputURL:** `GET /users?employmentStatus=active&pageSize=100`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Root>" } }
    ```
  - **expectedResult:** `200`; `items[].id` contains Alice's `id`, not Colin's;
    every `items[].employmentStatus === "active"`.

- **Test 3 — an unrecognised employment-status value is rejected**
  - **inputURL:** `GET /users?employmentStatus=retired`
  - **inputRequest:**
    ```json
    { "headers": { "authorization": "Bearer <token:Root>" } }
    ```
  - **expectedResult:** `400`; body names `employmentStatus` as invalid; no list
    is returned.
